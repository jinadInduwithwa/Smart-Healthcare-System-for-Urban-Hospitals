// controllers/appointments.controller.js
import { AppointmentService } from "../services/appointments.service.js";
const svc = new AppointmentService();

export const getSpecialties = async (req, res, next) => {
  try {
    res.json({ data: await svc.listSpecialties() });
  } catch (e) { next(e); }
};

export const getDoctors = async (req, res, next) => {
  try {
    res.json({ data: await svc.listDoctorsBySpecialty(req.query.specialty) });
  } catch (e) { next(e); }
};

export const getSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;
    res.json({ data: await svc.listSlots({ doctorId, dateISO: date }) });
  } catch (e) { next(e); }
};

export const postCreate = async (req, res, next) => {
  try {
    const patientId = req.user?._id;
    const { doctorId, slotId } = req.body;
    const created = await svc.createAppointment({ patientId, doctorId, slotId });
    res.status(201).json({ data: created });
  } catch (e) { next(e); }
};

export const postPay = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;
    res.json({ data: await svc.payAndConfirm({ appointmentId }) });
  } catch (e) { next(e); }
};

export const getMine = async (req, res, next) => {
  try {
    const patientId = req.user?._id;
    res.json({ data: await svc.listAppointmentsForPatient({ patientId }) });
  } catch (e) { next(e); }
};
