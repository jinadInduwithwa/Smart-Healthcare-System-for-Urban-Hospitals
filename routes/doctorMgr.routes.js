import express from 'express';
import DoctorMgrController from '../controllers/doctorMgr.controller.js';
import { auth, authorize } from '../middleware/auth.middleware.js';
import { validateRegistration } from '../validation/auth.validation.js';

const router = express.Router();

const controller = DoctorMgrController;

router.post('/doctors', auth, authorize('ADMIN'), validateRegistration, controller.addDoctor.bind(controller));
router.patch('/doctors/:id', auth, authorize('ADMIN'), controller.updateDoctor.bind(controller));
router.delete('/doctors/:id', auth, authorize('ADMIN'), controller.deleteDoctor.bind(controller));
router.get('/doctors', auth, authorize('ADMIN'), controller.getDoctors.bind(controller)); // Added GET route

export default router;