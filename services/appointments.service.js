// services/appointments.service.js
import mongoose from "mongoose";
import { Availability } from "../models/availability.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";

export class AppointmentService {
  async listSpecialties() {
    return [
      "General OPD",
      "Cardiologist",
      "Pediatrician",
      "Dermatologist",
      "Gynecologist",
      "Psychiatrist",
      "Neurology",
      "Cave",
    ];
  }

  async listDoctorsBySpecialty(specialization) {
    const q = specialization ? { specialization } : {};
    return Doctor.find(q)
      .populate("userId", "firstName lastName email")
      .lean();
  }

  async listSlots({ doctorId, dateISO }) {
    if (!doctorId || !dateISO) return [];
    const day = new Date(dateISO);
    day.setHours(0, 0, 0, 0);
    return Availability.find({ doctor: doctorId, date: day, isBooked: false })
      .sort({ startTime: 1 })
      .lean();
  }

  // atomic booking to prevent double-booking
  async createAppointment({ patientId, doctorId, slotId }) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1) Read the slot first for clarity and logging
      const slot = await Availability.findById(slotId).lean();
      if (!slot) {
        console.warn("[createAppointment] slot not found", { slotId, doctorId, patientId });
        throw new Error("Slot not found");
      }
      if (slot.isBooked) {
        console.warn("[createAppointment] slot already booked", { slotId });
        throw new Error("Slot unavailable");
      }
      // Optional: warn if doctor mismatch (but don't block)
      if (doctorId && slot.doctor && String(slot.doctor) !== String(doctorId)) {
        console.warn("[createAppointment] doctor mismatch", {
          slotDoctor: String(slot.doctor),
          givenDoctor: String(doctorId),
          slotId,
        });
      }

      // 2) Single atomic flip to booked (do not include doctor in the filter)
      const u = await Availability.updateOne(
        { _id: slotId, isBooked: false },
        { $set: { isBooked: true } },
        { session }
      );
      if (u.modifiedCount !== 1) {
        console.warn("[createAppointment] updateOne modifiedCount=0", { slotId });
        throw new Error("Slot unavailable");
      }

      // 3) Create the appointment
      const [appt] = await Appointment.create(
        [
          {
            patient: patientId,
            doctor: doctorId,
            availability: slotId,
            status: "PENDING",
            amountCents: 250000,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // 4) Return populated doc
      return Appointment.findById(appt._id)
        .populate({ path: "doctor", populate: { path: "userId", select: "firstName lastName email" } })
        .populate("availability")
        .lean();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  async payAndConfirm({ appointmentId }) {
    await Appointment.updateOne(
      { _id: appointmentId },
      { $set: { status: "CONFIRMED" } }
    );
    return Appointment.findById(appointmentId)
      .populate({ path: "doctor", populate: { path: "userId", select: "firstName lastName email" } })
      .populate("availability")
      .lean();
  }

  // services/appointments.service.js
  async listAppointmentsForPatient({ patientId }) {
    return Appointment.find({ patient: patientId })
      .populate({ path: "doctor", populate: { path: "userId", select: "firstName lastName email" } })
      .populate("availability")
      .sort({ createdAt: -1 })
      .lean();
  }

  // Add this new method for fetching appointments for a doctor
  async listAppointmentsForDoctor({ doctorId }) {
    return Appointment.find({ doctor: doctorId })
      .populate({ path: "patient", select: "firstName lastName email" })
      .populate("availability")
      .sort({ createdAt: -1 })
      .lean();
  }

  // Add this new method for updating appointment status
  async updateAppointmentStatus({ appointmentId, status, doctorId }) {
    // Verify that the appointment belongs to the doctor
    const appointment = await Appointment.findOne({ 
      _id: appointmentId, 
      doctor: doctorId 
    });
    
    if (!appointment) {
      throw new Error("Appointment not found or does not belong to this doctor");
    }
    
    // Update the appointment status
    await Appointment.updateOne(
      { _id: appointmentId },
      { $set: { status } }
    );
    
    // If the appointment is being cancelled, we should also free up the slot
    if (status === "CANCELLED") {
      await Availability.updateOne(
        { _id: appointment.availability },
        { $set: { isBooked: false } }
      );
    }
    
    // Return the updated appointment
    return Appointment.findById(appointmentId)
      .populate({ path: "patient", select: "firstName lastName email" })
      .populate("availability")
      .lean();
  }

}
