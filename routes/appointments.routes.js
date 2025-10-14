// // routes/appointments.routes.js
// import { Router } from "express";
// import { auth } from "../middleware/auth.middleware.js";
// import {
//   getSpecialties,
//   getDoctors,
//   getSlots,
//   postCreate,
//   postPay,
//   getMine,
// } from "../controllers/appointments.controller.js";

// const router = Router();

// router.get("/specialties", getSpecialties);
// router.get("/doctors", getDoctors);
// router.get("/slots", getSlots);

// router.post("/", auth, postCreate);
// router.post("/pay", auth, postPay);
// router.get("/mine", auth, getMine);

// export default router;

// routes/appointments.routes.js (updated with new route)
import { Router } from "express";
import { auth, authorize } from "../middleware/auth.middleware.js"; // Added authorize to import
import {
  getSpecialties,
  getDoctors,
  getSlots,
  postCreate,
  postPay,
  getMine,
  postComplete, // Added import
} from "../controllers/appointments.controller.js";

const router = Router();

router.get("/specialties", getSpecialties);
router.get("/doctors", getDoctors);
router.get("/slots", getSlots);

router.post("/", auth, postCreate);
router.post("/pay", auth, postPay);
router.get("/mine", auth, getMine);
router.post("/complete", auth, authorize("DOCTOR"), postComplete); // Added new route

export default router;