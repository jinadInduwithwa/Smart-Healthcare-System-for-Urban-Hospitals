import { body, validationResult, query } from "express-validator";
import { validateTestName } from "../utils/test.helper.js";
import { AppError } from "../utils/AppError.js";

export const validateAddConsultation = [
  body("patient")
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
      if (value && value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          const diag = value[i];
          // Check if diagnosis is an object
          if (!diag || typeof diag !== 'object') {
            throw new Error(`Diagnosis at index ${i} must be an object`);
          }
          if (!diag.code) {
            throw new Error(`Diagnosis at index ${i} must have a code`);
          }
          // More flexible regex to match our actual diagnosis codes
          if (!/^[A-Z]\d{1,2}(\.\d{1,3})?$/.test(diag.code)) {
            throw new Error(`Diagnosis at index ${i} has invalid ICD-10 code format: ${diag.code}`);
          }
          if (!diag.description) {
            throw new Error(`Diagnosis at index ${i} must have a description`);
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
      if (value && value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          const med = value[i];
          // Check if medication is an object
          if (!med || typeof med !== 'object') {
            throw new Error(`Medication at index ${i} must be an object`);
          }
          if (!med.drug) {
            throw new Error(`Medication at index ${i} must have a drug name`);
          }
          if (!med.dosage) {
            throw new Error(`Medication at index ${i} must have a dosage`);
          }
          if (!med.frequency) {
            throw new Error(`Medication at index ${i} must have a frequency`);
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
      if (value && value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          const test = value[i];
          // Check if test is a string
          if (!test || typeof test !== 'string') {
            throw new Error(`Test at index ${i} must be a string`);
          }
          try {
            await validateTestName(test);
          } catch (error) {
            throw new Error(`Invalid test name at index ${i}: ${test}`);
          }
        }
      }
      return true;
    }),
  body("status")
    .optional()
    .isIn(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid status value. Must be one of: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", JSON.stringify(errors.array(), null, 2));
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

export const validateSearchTests = [
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
      if (value && value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          const diag = value[i];
          // Check if diagnosis is an object
          if (!diag || typeof diag !== 'object') {
            throw new Error(`Diagnosis at index ${i} must be an object`);
          }
          if (!diag.code) {
            throw new Error(`Diagnosis at index ${i} must have a code`);
          }
          // More flexible regex to match our actual diagnosis codes
          if (!/^[A-Z]\d{1,2}(\.\d{1,3})?$/.test(diag.code)) {
            throw new Error(`Diagnosis at index ${i} has invalid ICD-10 code format: ${diag.code}`);
          }
          if (!diag.description) {
            throw new Error(`Diagnosis at index ${i} must have a description`);
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
      if (value && value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          const med = value[i];
          // Check if medication is an object
          if (!med || typeof med !== 'object') {
            throw new Error(`Medication at index ${i} must be an object`);
          }
          if (!med.drug) {
            throw new Error(`Medication at index ${i} must have a drug name`);
          }
          if (!med.dosage) {
            throw new Error(`Medication at index ${i} must have a dosage`);
          }
          if (!med.frequency) {
            throw new Error(`Medication at index ${i} must have a frequency`);
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
      if (value && value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          const test = value[i];
          // Check if test is a string
          if (!test || typeof test !== 'string') {
            throw new Error(`Test at index ${i} must be a string`);
          }
          try {
            await validateTestName(test);
          } catch (error) {
            throw new Error(`Invalid test name at index ${i}: ${test}`);
          }
        }
      }
      return true;
    }),
  body("status")
    .optional()
    .isIn(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid status value. Must be one of: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];