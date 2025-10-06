import express from "express";
import PatientMgrController from "../controllers/patientMgr.controller.js";
import { auth, authorize } from "../middleware/auth.middleware.js";
import { validateRegistration } from "../validation/auth.validation.js";

const router = express.Router();

const controller = PatientMgrController;

router.post("/patients", auth, authorize("ADMIN"), validateRegistration, controller.addPatient.bind(controller));
router.patch("/patients/:id", auth, authorize("ADMIN"), controller.updatePatient.bind(controller));
router.delete("/patients/:id", auth, authorize("ADMIN"), controller.deletePatient.bind(controller));
router.get("/patients", auth, authorize("ADMIN"), controller.getPatients.bind(controller));

export default router;