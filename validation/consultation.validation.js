import { body, validationResult, query } from "express-validator";
import { validateTestName } from "../utils/test.helper.js";
import { AppError } from "../utils/AppError.js";

export const validateAddConsultation = [
  body("patientId")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isMongoId()
    .withMessage("Invalid patient ID format"),
  body("consultationDate")
    .notEmpty()
    .withMessage("Consultation date is required")
    .isISO8601()
    .withMessage("Consultation date must be a valid ISO 8601 date"),
  body("diagnosis")
    .optional()
    .isArray()
    .withMessage("Diagnosis must be an array")
    .custom((value) => {
      if (value.length > 0) {
        for (const diag of value) {
          if (!diag.code || !/^[A-Z]\d{2}(\.\d{1,2})?$/.test(diag.code)) {
            throw new Error("Each diagnosis must have a valid ICD-10 code format");
          }
        }
      }
      return true;
    }),
  body("clinicalNotes")
    .optional()
    .isObject()
    .withMessage("Clinical notes must be an object"),
  body("medications")
    .optional()
    .isArray()
    .withMessage("Medications must be an array")
    .custom((value) => {
      if (value.length > 0) {
        for (const med of value) {
          if (!med.drug || !med.dosage || !med.frequency) {
            throw new Error("Each medication must have drug, dosage, and frequency");
          }
        }
      }
      return true;
    }),
  body("recommendedTests")
    .optional()
    .isArray()
    .withMessage("Recommended tests must be an array")
    .custom(async (value) => {
      if (value.length > 0) {
        for (const test of value) {
          try {
            await validateTestName(test);
          } catch (error) {
            throw new Error(`Invalid test name: ${test}`);
          }
        }
      }
      return true;
    }),
  body("status")
    .optional()
    .isIn(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid status value"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

export const validateSearchDiagnosis = [
  query("query")
    .notEmpty()
    .withMessage("Query parameter is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Query must be between 1 and 100 characters"),
  query("maxResults")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Max results must be between 1 and 50"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

export const validateUpdateConsultation = [
  body("consultationDate")
    .optional()
    .isISO8601()
    .withMessage("Consultation date must be a valid ISO 8601 date"),
  body("diagnosis")
    .optional()
    .isArray()
    .withMessage("Diagnosis must be an array")
    .custom((value) => {
      if (value.length > 0) {
        for (const diag of value) {
          if (!diag.code || !/^[A-Z]\d{2}(\.\d{1,2})?$/.test(diag.code)) {
            throw new Error("Each diagnosis must have a valid ICD-10 code format");
          }
        }
      }
      return true;
    }),
  body("clinicalNotes")
    .optional()
    .isObject()
    .withMessage("Clinical notes must be an object"),
  body("medications")
    .optional()
    .isArray()
    .withMessage("Medications must be an array")
    .custom((value) => {
      if (value.length > 0) {
        for (const med of value) {
          if (!med.drug || !med.dosage || !med.frequency) {
            throw new Error("Each medication must have drug, dosage, and frequency");
          }
        }
      }
      return true;
    }),
  body("recommendedTests")
    .optional()
    .isArray()
    .withMessage("Recommended tests must be an array"),
  body("status")
    .optional()
    .isIn(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid status value"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];