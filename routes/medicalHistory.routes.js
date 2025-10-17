import express from "express";
import { auth, authorize } from "../middleware/auth.middleware.js";
import { getMyMedicalHistory, getPatientMedicalHistory } from "../controllers/medicalHistory.controller.js";

const router = express.Router();

// Patient: get own medical history
router.get("/me", auth, getMyMedicalHistory);

// Doctor/Admin: get a patient's medical history by userId
router.get("/patient/:userId", auth, authorize("DOCTOR", "ADMIN"), getPatientMedicalHistory);

export default router;
