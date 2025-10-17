import express from "express";
import {
  createPayment,
  createStripeCheckout,
  verifyStripePayment,
  getOutstandingPayments,
  getPaymentHistory,
  getPaymentSummary,
  getPaymentById,
  processRefund,
  generateReceipt,
  handleStripeWebhook,
} from "../controllers/payment.controller.js";
import { auth, authorize } from "../middleware/auth.middleware.js";
import {
  validateCreatePayment,
  validateStripeCheckout,
  validateVerifyPayment,
  validateRefund,
} from "../validation/payment.validation.js";

const router = express.Router();

// Stripe webhook (must be before authenticate middleware and without body parsing)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// All routes below require authentication
router.use(auth);

// Create a new payment
router.post("/", validateCreatePayment, createPayment);

// Create Stripe checkout session
router.post(
  "/:paymentId/stripe-checkout",
  validateStripeCheckout,
  createStripeCheckout
);

// Verify Stripe payment
router.post("/verify-stripe", validateVerifyPayment, verifyStripePayment);

// Get outstanding payments
router.get("/outstanding/list", getOutstandingPayments);

// Get payment history
router.get("/history/list", getPaymentHistory);

// Get payment summary
router.get("/summary/overview", getPaymentSummary);

// Get payment by ID
router.get("/:paymentId", getPaymentById);

// Process refund
router.post("/:paymentId/refund", validateRefund, processRefund);

// Generate receipt
router.get("/:paymentId/receipt", generateReceipt);

export default router;
