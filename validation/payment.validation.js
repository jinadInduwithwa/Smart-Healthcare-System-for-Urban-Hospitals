import { body, param, query, validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }
  next();
};

/**
 * Validate create payment request
 */
export const validateCreatePayment = [
  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isMongoId()
    .withMessage("Invalid appointment ID format"),

  body("amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("paymentMethod")
    .optional()
    .isIn(["CARD", "INSURANCE", "HOSPITAL", "ONLINE"])
    .withMessage("Invalid payment method"),

  validate,
];

/**
 * Validate Stripe checkout request
 */
export const validateStripeCheckout = [
  param("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required")
    .isMongoId()
    .withMessage("Invalid payment ID format"),

  body("successUrl")
    .notEmpty()
    .withMessage("Success URL is required")
    .isURL()
    .withMessage("Success URL must be a valid URL"),

  body("cancelUrl")
    .notEmpty()
    .withMessage("Cancel URL is required")
    .isURL()
    .withMessage("Cancel URL must be a valid URL"),

  validate,
];

/**
 * Validate verify payment request
 */
export const validateVerifyPayment = [
  body("sessionId")
    .notEmpty()
    .withMessage("Session ID is required")
    .isString()
    .withMessage("Session ID must be a string"),

  validate,
];

/**
 * Validate payment ID parameter
 */
export const validatePaymentId = [
  param("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required")
    .isMongoId()
    .withMessage("Invalid payment ID format"),

  validate,
];

/**
 * Validate refund request
 */
export const validateRefund = [
  param("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required")
    .isMongoId()
    .withMessage("Invalid payment ID format"),

  body("refundAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Refund amount must be a positive number"),

  validate,
];

/**
 * Validate payment history query parameters
 */
export const validatePaymentHistoryQuery = [
  query("status")
    .optional()
    .isIn([
      "PENDING",
      "PROCESSING",
      "PAID",
      "COMPLETED",
      "FAILED",
      "CANCELLED",
      "REFUNDED",
      "OVERDUE",
    ])
    .withMessage("Invalid status"),

  query("paymentMethod")
    .optional()
    .isIn(["CARD", "INSURANCE", "HOSPITAL", "ONLINE"])
    .withMessage("Invalid payment method"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),

  query("search").optional().isString().withMessage("Search must be a string"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  validate,
];
