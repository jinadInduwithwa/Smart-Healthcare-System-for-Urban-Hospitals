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

// Add this new controller method for fetching doctor appointments
export const getDoctorAppointments = async (req, res, next) => {
  try {
    // Check if user is a doctor and has a doctor profile
    if (!req.user || req.user.role !== 'DOCTOR') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }
    
    if (!req.user.doctor || !req.user.doctor._id) {
      return res.status(400).json({ message: 'Doctor profile not found' });
    }
    
    const doctorId = req.user.doctor._id;
    res.json({ data: await svc.listAppointmentsForDoctor({ doctorId }) });
  } catch (e) { 
    next(e); 
  }
};

// Add this new controller method for updating appointment status
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    // Check if user is a doctor and has a doctor profile
    if (!req.user || req.user.role !== 'DOCTOR') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }
    
    if (!req.user.doctor || !req.user.doctor._id) {
      return res.status(400).json({ message: 'Doctor profile not found' });
    }
    
    const { appointmentId } = req.params;
    const { status } = req.body;
    const doctorId = req.user.doctor._id;
    
    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const updatedAppointment = await svc.updateAppointmentStatus({ 
      appointmentId, 
      status, 
      doctorId 
    });
    
    res.json({ 
      message: 'Appointment status updated successfully', 
      data: updatedAppointment 
    });
  } catch (e) { 
    next(e); 
  }
};
