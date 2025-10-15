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
} from "../controllers/appointments.controller.js";

const router = Router();

router.get("/specialties", getSpecialties);
router.get("/doctors", getDoctors);
router.get("/slots", getSlots);

router.post("/", auth, postCreate);
router.post("/pay", auth, postPay);
router.get("/mine", auth, getMine);

export default router;