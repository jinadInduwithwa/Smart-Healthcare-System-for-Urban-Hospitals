import express from "express";
import { ConsultationController } from "../controllers/consultation.controller.js";
import { auth, authorize } from "../middleware/auth.middleware.js";
import { validateAddConsultation, validateSearchDiagnosis, validateSearchTests, validateUpdateConsultation } from "../validation/consultation.validation.js";

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

// Protected route for getting all patients (DOCTOR or ADMIN)
router.get(
  "/patients",
  auth,
  authorize("DOCTOR"),
  consultationController.getAllPatients
);

// Protected route for searching diagnosis codes (only doctors)
router.get(
  "/search-diagnosis",
  auth,
  authorize("DOCTOR"),
  validateSearchDiagnosis,
  consultationController.searchDiagnosisCodes
);

// Protected route for searching test names (only doctors)
router.get(
  "/search-tests",
  auth,
  authorize("DOCTOR"),
  validateSearchTests,
  consultationController.searchTestNames
);

// Protected route for viewing consultations by patient (doctors or patients can view their own)
router.get(
  "/patient/:patientId",
  auth,
  consultationController.getConsultationsByPatient
);

// Protected route for updating a consultation (only the creating doctor)
router.patch(
  "/:id",
  auth,
  authorize("DOCTOR"),
  validateUpdateConsultation,
  consultationController.updateConsultation
);

// Protected route for deleting a consultation (only the creating doctor)
router.delete(
  "/:id",
  auth,
  authorize("DOCTOR"),
  consultationController.deleteConsultation
);

export default router;