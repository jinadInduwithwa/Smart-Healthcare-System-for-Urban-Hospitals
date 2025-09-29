import express from "express";
import { AppointmentsController } from "../controllers/appointments.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();
const ctrl = new AppointmentsController();

// Public (for browsing specialties/doctors/slots)
router.get("/specialties", ctrl.getSpecialties);
router.get("/doctors",     ctrl.getDoctors);
router.get("/slots",       ctrl.getSlots);

// Protected (must be logged in as PATIENT)
router.post("/hold",   auth, ctrl.postHold);
router.post("/",       auth, ctrl.postCreate);
router.post("/pay",    auth, ctrl.postPay);

export default router;
