// // controllers/appointments.controller.js
// import { AppointmentService } from "../services/appointments.service.js";
// const svc = new AppointmentService();

// export const getSpecialties = async (req, res, next) => {
//   try {
//     res.json({ data: await svc.listSpecialties() });
//   } catch (e) { next(e); }
// };

// export const getDoctors = async (req, res, next) => {
//   try {
//     res.json({ data: await svc.listDoctorsBySpecialty(req.query.specialty) });
//   } catch (e) { next(e); }
// };

// export const getSlots = async (req, res, next) => {
//   try {
//     const { doctorId, date } = req.query;
//     res.json({ data: await svc.listSlots({ doctorId, dateISO: date }) });
//   } catch (e) { next(e); }
// };

// export const postCreate = async (req, res, next) => {
//   try {
//     const patientId = req.user?._id;
//     const { doctorId, slotId } = req.body;
//     const created = await svc.createAppointment({ patientId, doctorId, slotId });
//     res.status(201).json({ data: created });
//   } catch (e) { next(e); }
// };

// export const postPay = async (req, res, next) => {
//   try {
//     const { appointmentId } = req.body;
//     res.json({ data: await svc.payAndConfirm({ appointmentId }) });
//   } catch (e) { next(e); }
// };

// export const getMine = async (req, res, next) => {
//   try {
//     const patientId = req.user?._id;
//     res.json({ data: await svc.listAppointmentsForPatient({ patientId }) });
//   } catch (e) { next(e); }
// };

// controllers/appointments.controller.js (updated with new function)
import { AppointmentService } from "../services/appointments.service.js";
import { Appointment } from "../models/appointment.model.js"; // Added import for direct model access in new function
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

export const postComplete = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appointment.status !== "CONFIRMED") {
      return res.status(400).json({ message: "Only confirmed appointments can be completed" });
    }
    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "COMPLETED" },
      { new: true }
    );
    res.json({ data: updated });
  } catch (e) { next(e); }
};