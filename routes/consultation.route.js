import express from "express";
import { ConsultationController } from "../controllers/consultation.controller.js";
import { auth, authorize } from "../middleware/auth.middleware.js";
import { validateAddConsultation, validateSearchDiagnosis } from "../validation/consultation.validation.js";

const router = express.Router();
const consultationController = new ConsultationController();

// Protected route for adding a consultation (only doctors)
router.post(
  "/",
  auth,
  authorize("DOCTOR"),
  validateAddConsultation,
  consultationController.addConsultation
);

// Protected route for searching diagnosis codes (only doctors)
router.get(
  "/search-diagnosis",
  auth,
  authorize("DOCTOR"),
  validateSearchDiagnosis,
  consultationController.searchDiagnosisCodes
);

export default router;