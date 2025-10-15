import Stripe from "stripe";
import Payment from "../models/payment.model.js";
import Appointment from "../models/appointment.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  /**
   * Create a new payment record
   */
  async createPayment(appointmentId, amount, userId, dueDate) {
    try {
      // Verify appointment exists
      const appointment = await Appointment.findById(appointmentId)
        .populate("patient")
        .populate("doctor");

      if (!appointment) {
        throw new AppError("Appointment not found", 404);
      }

      // Get patient from user
      const patient = await Patient.findOne({ user: userId });
      if (!patient) {
        throw new AppError("Patient profile not found", 404);
      }

      // Check if payment already exists for this appointment
      const existingPayment = await Payment.findOne({
        appointment: appointmentId,
      });

      if (existingPayment) {
        throw new AppError("Payment already exists for this appointment", 400);
      }

      // Calculate due date (default to 7 days from now)
      const paymentDueDate = dueDate
        ? new Date(dueDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Create payment record
      const payment = await Payment.create({
        appointment: appointmentId,
        patient: patient._id,
        doctor: appointment.doctor._id,
        amount: amount || 3000, // Default amount if not provided
        dueDate: paymentDueDate,
        description: `Payment for appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
      });

      logger.info(`Payment created: ${payment._id}`);

      return await payment.populate([
        { path: "appointment" },
        { path: "patient", populate: { path: "user" } },
        { path: "doctor", populate: { path: "user" } },
      ]);
    } catch (error) {
      logger.error(`Error creating payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Stripe checkout session
   */
  async createStripeCheckout(paymentId, successUrl, cancelUrl) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate({
          path: "patient",
          populate: { path: "user" },
        })
        .populate({
          path: "doctor",
          populate: { path: "user" },
        })
        .populate("appointment");

      if (!payment) {
        throw new AppError("Payment not found", 404);
      }

      if (payment.status === "PAID" || payment.status === "COMPLETED") {
        throw new AppError("Payment already completed", 400);
      }

      // Create or retrieve Stripe customer
      let stripeCustomerId = payment.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: payment.patient.user.email,
          name: `${payment.patient.user.firstName} ${payment.patient.user.lastName}`,
          metadata: {
            patientId: payment.patient._id.toString(),
            userId: payment.patient.user._id.toString(),
          },
        });
        stripeCustomerId = customer.id;
        payment.stripeCustomerId = stripeCustomerId;
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: payment.currency.toLowerCase(),
              product_data: {
                name: `Medical Appointment - ${payment.invoiceNumber}`,
                description:
                  payment.description ||
                  `Appointment with Dr. ${payment.doctor.user.firstName} ${payment.doctor.user.lastName}`,
                metadata: {
                  appointmentId: payment.appointment._id.toString(),
                  doctorName: `${payment.doctor.user.firstName} ${payment.doctor.user.lastName}`,
                  specialization: payment.doctor.specialization,
                },
              },
              unit_amount: Math.round(payment.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          paymentId: payment._id.toString(),
          appointmentId: payment.appointment._id.toString(),
          patientId: payment.patient._id.toString(),
          invoiceNumber: payment.invoiceNumber,
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      });

      // Update payment with session ID
      payment.stripeSessionId = session.id;
      payment.status = "PROCESSING";
      await payment.save();

      logger.info(
        `Stripe checkout session created: ${session.id} for payment: ${payment._id}`
      );

      return {
        sessionId: session.id,
        url: session.url,
        paymentId: payment._id,
      };
    } catch (error) {
      logger.error(`Error creating Stripe checkout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify Stripe payment
   */
  async verifyStripePayment(sessionId) {
    try {
      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"],
      });

      if (!session) {
        throw new AppError("Stripe session not found", 404);
      }

      // Find payment by session ID
      const payment = await Payment.findOne({ stripeSessionId: sessionId })
        .populate({
          path: "patient",
          populate: { path: "user" },
        })
        .populate({
          path: "doctor",
          populate: { path: "user" },
        })
        .populate("appointment");

      if (!payment) {
        throw new AppError("Payment not found", 404);
      }

      // Check if payment was successful
      if (session.payment_status === "paid") {
        // Update payment status
        payment.status = "PAID";
        payment.paidAt = new Date();
        payment.transactionId = session.payment_intent?.id || session.id;
        payment.stripePaymentIntentId = session.payment_intent?.id;

        // Update appointment status to confirmed
        if (payment.appointment) {
          payment.appointment.paymentStatus = "PAID";
          await payment.appointment.save();
        }

        await payment.save();

        logger.info(`Payment verified and marked as paid: ${payment._id}`);

        return payment;
      } else if (session.payment_status === "unpaid") {
        payment.status = "FAILED";
        payment.errorMessage = "Payment was not completed";
        await payment.save();

        throw new AppError("Payment was not completed", 400);
      } else {
        throw new AppError(`Payment status: ${session.payment_status}`, 400);
      }
    } catch (error) {
      logger.error(`Error verifying Stripe payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get outstanding payments for a patient
   */
  async getOutstandingPayments(userId) {
    try {
      const patient = await Patient.findOne({ user: userId });
      if (!patient) {
        throw new AppError("Patient profile not found", 404);
      }

      const payments = await Payment.find({
        patient: patient._id,
        status: { $in: ["PENDING", "OVERDUE", "PROCESSING"] },
      })
        .populate({
          path: "appointment",
          populate: { path: "availableSlot" },
        })
        .populate({
          path: "doctor",
          populate: { path: "user" },
        })
        .populate({
          path: "patient",
          populate: { path: "user" },
        })
        .sort({ dueDate: 1 });

      return payments;
    } catch (error) {
      logger.error(`Error fetching outstanding payments: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get payment history for a patient
   */
  async getPaymentHistory(userId, filters = {}) {
    try {
      const patient = await Patient.findOne({ user: userId });
      if (!patient) {
        throw new AppError("Patient profile not found", 404);
      }

      const query = { patient: patient._id };

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.paymentMethod) {
        query.paymentMethod = filters.paymentMethod;
      }

      if (filters.startDate || filters.endDate) {
        query.paidAt = {};
        if (filters.startDate) {
          query.paidAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.paidAt.$lte = new Date(filters.endDate);
        }
      }

      // Search by invoice number or transaction ID
      if (filters.search) {
        query.$or = [
          { invoiceNumber: { $regex: filters.search, $options: "i" } },
          { transactionId: { $regex: filters.search, $options: "i" } },
        ];
      }

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        Payment.find(query)
          .populate({
            path: "appointment",
            populate: { path: "availableSlot" },
          })
          .populate({
            path: "doctor",
            populate: { path: "user" },
          })
          .sort({ paidAt: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Payment.countDocuments(query),
      ]);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error(`Error fetching payment history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get payment summary for a patient
   */
  async getPaymentSummary(userId) {
    try {
      const patient = await Patient.findOne({ user: userId });
      if (!patient) {
        throw new AppError("Patient profile not found", 404);
      }

      const summary = await Payment.getPaymentSummary(patient._id);

      // Add insurance coverage (placeholder - implement based on your insurance logic)
      summary.insuranceCoverage = 0;

      return summary;
    } catch (error) {
      logger.error(`Error fetching payment summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId, userId) {
    try {
      const patient = await Patient.findOne({ user: userId });
      if (!patient) {
        throw new AppError("Patient profile not found", 404);
      }

      const payment = await Payment.findOne({
        _id: paymentId,
        patient: patient._id,
      })
        .populate({
          path: "appointment",
          populate: { path: "availableSlot" },
        })
        .populate({
          path: "doctor",
          populate: { path: "user" },
        })
        .populate({
          path: "patient",
          populate: { path: "user" },
        });

      if (!payment) {
        throw new AppError("Payment not found", 404);
      }

      return payment;
    } catch (error) {
      logger.error(`Error fetching payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentId, userId, refundAmount) {
    try {
      const patient = await Patient.findOne({ user: userId });
      if (!patient) {
        throw new AppError("Patient profile not found", 404);
      }

      const payment = await Payment.findOne({
        _id: paymentId,
        patient: patient._id,
      });

      if (!payment) {
        throw new AppError("Payment not found", 404);
      }

      if (payment.status !== "PAID") {
        throw new AppError("Only paid payments can be refunded", 400);
      }

      if (!payment.stripePaymentIntentId) {
        throw new AppError("No Stripe payment intent found", 400);
      }

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmount
          ? Math.round(refundAmount * 100)
          : Math.round(payment.amount * 100),
        reason: "requested_by_customer",
        metadata: {
          paymentId: payment._id.toString(),
          invoiceNumber: payment.invoiceNumber,
        },
      });

      // Update payment with refund details
      await payment.processRefund(
        refund.id,
        refundAmount || payment.amount,
        "Customer requested refund"
      );

      logger.info(`Refund processed for payment: ${payment._id}`);

      return {
        refundId: refund.id,
        refundAmount: refund.amount / 100,
        status: refund.status,
      };
    } catch (error) {
      logger.error(`Error processing refund: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate payment receipt
   */
  async generateReceipt(paymentId, userId) {
    try {
      const payment = await this.getPaymentById(paymentId, userId);

      if (payment.status !== "PAID" && payment.status !== "COMPLETED") {
        throw new AppError("Receipt only available for paid payments", 400);
      }

      const receipt = {
        invoiceNumber: payment.invoiceNumber,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paidAt: payment.paidAt,
        paymentMethod: payment.paymentMethod,
        patientName: `${payment.patient.user.firstName} ${payment.patient.user.lastName}`,
        patientId: payment.patient.user._id,
        doctorName: `${payment.doctor.user.firstName} ${payment.doctor.user.lastName}`,
        specialization: payment.doctor.specialization,
        appointmentDate: payment.appointment.date,
        appointmentTime: payment.appointment.availableSlot?.time || "N/A",
        hospitalBranch:
          payment.appointment.availableSlot?.location || "Main Hospital",
      };

      return receipt;
    } catch (error) {
      logger.error(`Error generating receipt: ${error.message}`);
      throw error;
    }
  }

  /**
   * Webhook handler for Stripe events
   */
  async handleStripeWebhook(event) {
    try {
      logger.info(`Stripe webhook received: ${event.type}`);

      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutCompleted(event.data.object);
          break;

        case "payment_intent.succeeded":
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case "payment_intent.payment_failed":
          await this.handlePaymentFailed(event.data.object);
          break;

        case "charge.refunded":
          await this.handleRefundCompleted(event.data.object);
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      logger.error(`Error handling Stripe webhook: ${error.message}`);
      throw error;
    }
  }

  async handleCheckoutCompleted(session) {
    const payment = await Payment.findOne({
      stripeSessionId: session.id,
    }).populate("appointment");

    if (payment) {
      payment.status = "PAID";
      payment.paidAt = new Date();
      payment.transactionId = session.payment_intent;
      payment.stripePaymentIntentId = session.payment_intent;

      if (payment.appointment) {
        payment.appointment.paymentStatus = "PAID";
        await payment.appointment.save();
      }

      await payment.save();
      logger.info(`Payment marked as paid via webhook: ${payment._id}`);
    }
  }

  async handlePaymentSucceeded(paymentIntent) {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (payment && payment.status !== "PAID") {
      payment.status = "PAID";
      payment.paidAt = new Date();
      await payment.save();
      logger.info(`Payment intent succeeded via webhook: ${payment._id}`);
    }
  }

  async handlePaymentFailed(paymentIntent) {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (payment) {
      payment.status = "FAILED";
      payment.errorMessage =
        paymentIntent.last_payment_error?.message || "Payment failed";
      await payment.save();
      logger.info(`Payment failed via webhook: ${payment._id}`);
    }
  }

  async handleRefundCompleted(charge) {
    const payment = await Payment.findOne({
      transactionId: charge.payment_intent,
    });

    if (payment) {
      payment.status = "REFUNDED";
      payment.refundedAt = new Date();
      await payment.save();
      logger.info(`Refund completed via webhook: ${payment._id}`);
    }
  }
}

export default new PaymentService();
