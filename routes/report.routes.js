import express from "express";
import ReportController from "../controllers/report.controller.js";
import { auth, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();
const controller = ReportController;

router.get("/doctor-availability", auth, authorize("ADMIN"), controller.getDoctorAvailabilityReport);
router.get("/patient-check-ins", auth, authorize("ADMIN"), controller.getPatientCheckInReport);
router.get("/financial", auth, authorize("ADMIN"), controller.getFinancialReport);
router.get("/overview", auth, authorize("ADMIN"), controller.getOverviewStats);

export default router;