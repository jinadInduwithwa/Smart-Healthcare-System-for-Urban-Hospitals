import { Doctor } from "../models/doctor.model.js";
import { Availability } from "../models/availability.model.js";
import { Appointment } from "../models/appointment.model.js";
import { AppError } from "../utils/AppError.js";

/**
 * Appointment Scheduling core logic
 */
export class AppointmentService {
  async listSpecialties() {
    const docs = await Doctor.find({}).select("specialization").lean();
    return [...new Set(docs.map(d => d.specialization))].sort();
  }

  async listDoctorsBySpecialty(specialty) {
    if (!specialty) return [];
    return Doctor.find({ specialization: specialty }).populate("userId", "firstName lastName email").lean();
  }

  async listSlots({ doctorId, dateISO }) {
    if (!doctorId || !dateISO) return [];

    // Normalize to start of day in server’s TZ (same way you saved it)
    const day = new Date(dateISO);
    day.setHours(0, 0, 0, 0);

    return Availability.find({
      doctor: doctorId,
      date: day,
      isBooked: false,
    })
      .sort({ startTime: 1 })
      .lean();
  }

  async holdSlot({ slotId }) {
    const now = new Date();
    const holdUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
    const updated = await Availability.findOneAndUpdate(
      { _id: slotId, isBooked: false, $or: [{ holdUntil: null }, { holdUntil: { $lt: now } }] },
      { holdUntil },
      { new: true }
    );
    if (!updated) throw new AppError("Slot unavailable", 409);
    return updated;
  }

  async createAppointment({ patientId, doctorId, slotId }) {
    const slot = await Availability.findById(slotId).populate("doctor");
    if (!slot || slot.isBooked) throw new AppError("Slot unavailable", 409);

    // simple fee rule; if your doctor model stores fee elsewhere, adjust here
    const amountCents = 250000; // LKR 2,500.00 demo

    const appt = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      availability: slotId,
      amountCents,
      status: "PENDING",
      payment: { status: "NONE" },
    });
    return appt;
  }

  async payAndConfirm({ appointmentId }) {
    const appt = await Appointment.findById(appointmentId).populate("availability doctor patient");
    if (!appt) throw new AppError("Appointment not found", 404);
    if (appt.status === "CONFIRMED") return appt;

    // Simulate payment gateway
    const ok = Math.random() > 0.05;
    appt.payment = {
      provider: "MockGateway",
      status: ok ? "SUCCESS" : "FAILED",
      txnRef: ok ? "TXN" + Date.now() : null,
    };

    if (!ok) {
      await appt.save();
      throw new AppError("Payment failed", 402);
    }

    // Mark slot booked & confirm
    await Availability.findByIdAndUpdate(appt.availability, { isBooked: true, holdUntil: null });
    appt.status = "CONFIRMED";
    await appt.save();

    return appt;
  }
}
