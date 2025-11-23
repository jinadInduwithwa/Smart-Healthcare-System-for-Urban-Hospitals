import paymentService from "../services/payment.service.js";
import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a new payment
 */
export const createPayment = async (req, res, next) => {
  try {
    const { appointmentId, amount, dueDate } = req.body;
    const userId = req.user._id;

    if (!appointmentId) {
      throw new AppError("Appointment ID is required", 400);
    }

    const payment = await paymentService.createPayment(
      appointmentId,
      amount,
      userId,
      dueDate
    );

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    logger.error(`Create payment error: ${error.message}`);
    next(error);
  }
};

/**
 * Create Stripe checkout session
 */
export const createStripeCheckout = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { successUrl, cancelUrl } = req.body;

    // Debug logging
    logger.info(
      `Stripe checkout URLs - Success: ${successUrl}, Cancel: ${cancelUrl}`
    );

    if (!successUrl || !cancelUrl) {
      throw new AppError("Success URL and Cancel URL are required", 400);
    }

    const checkoutSession = await paymentService.createStripeCheckout(
      paymentId,
      successUrl,
      cancelUrl
    );

    res.status(200).json({
      success: true,
      message: "Stripe checkout session created",
      data: checkoutSession,
    });
  } catch (error) {
    logger.error(`Create Stripe checkout error: ${error.message}`);
    next(error);
  }
};

/**
 * Verify Stripe payment
 */
export const verifyStripePayment = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      throw new AppError("Session ID is required", 400);
    }

    const payment = await paymentService.verifyStripePayment(sessionId);

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: payment,
    });
  } catch (error) {
    logger.error(`Verify payment error: ${error.message}`);
    next(error);
  }
};

/**
 * Get outstanding payments
 */
export const getOutstandingPayments = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const payments = await paymentService.getOutstandingPayments(userId);

    res.status(200).json({
      success: true,
      message: "Outstanding payments retrieved successfully",
      data: payments,
    });
  } catch (error) {
    logger.error(`Get outstanding payments error: ${error.message}`);
    next(error);
  }
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const filters = {
      status: req.query.status,
      paymentMethod: req.query.paymentMethod,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await paymentService.getPaymentHistory(userId, filters);

    res.status(200).json({
      success: true,
      message: "Payment history retrieved successfully",
      data: result.payments,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(`Get payment history error: ${error.message}`);
    next(error);
  }
};

/**
 * Get payment summary
 */
export const getPaymentSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const summary = await paymentService.getPaymentSummary(userId);

    res.status(200).json({
      success: true,
      message: "Payment summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    logger.error(`Get payment summary error: ${error.message}`);
    next(error);
  }
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await paymentService.getPaymentById(paymentId, userId);

    res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data: payment,
    });
  } catch (error) {
    logger.error(`Get payment error: ${error.message}`);
    next(error);
  }
};

/**
 * Process refund
 */
export const processRefund = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { refundAmount } = req.body;
    const userId = req.user._id;

    const refund = await paymentService.processRefund(
      paymentId,
      userId,
      refundAmount
    );

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: refund,
    });
  } catch (error) {
    logger.error(`Process refund error: ${error.message}`);
    next(error);
  }
};

/**
 * Generate payment receipt
 */
export const generateReceipt = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const receipt = await paymentService.generateReceipt(paymentId, userId);

    res.status(200).json({
      success: true,
      message: "Receipt generated successfully",
      data: receipt,
    });
  } catch (error) {
    logger.error(`Generate receipt error: ${error.message}`);
    next(error);
  }
};

/**
 * Stripe webhook handler
 */
export const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // For testing without webhook secret
      event = req.body;
    }

    // Handle the event
    await paymentService.handleStripeWebhook(event);

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
