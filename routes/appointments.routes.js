// routes/appointments.routes.js
import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import {
  getSpecialties,
  getDoctors,
  getSlots,
  postCreate,
  postPay,
  getMine,
  getDoctorAppointments,
  updateAppointmentStatus, // Add this import
} from "../controllers/appointments.controller.js";

const router = Router();

router.get("/specialties", getSpecialties);
router.get("/doctors", getDoctors);
router.get("/slots", getSlots);

router.post("/", auth, postCreate);
router.post("/pay", auth, postPay);
router.get("/mine", auth, getMine);

// Add this new route for doctor appointments
router.get("/doctor", auth, getDoctorAppointments);

// Add this new route for updating appointment status
router.patch("/:appointmentId/status", auth, updateAppointmentStatus);

export default router;