import { AppointmentService } from "../services/appointments.service.js";
import { AppError } from "../utils/AppError.js";

export class AppointmentsController {
  constructor() {
    this.svc = new AppointmentService();

    this.getSpecialties = this.getSpecialties.bind(this);
    this.getDoctors     = this.getDoctors.bind(this);
    this.getSlots       = this.getSlots.bind(this);
    this.postHold       = this.postHold.bind(this);
    this.postCreate     = this.postCreate.bind(this);
    this.postPay        = this.postPay.bind(this);
  }

  async getSpecialties(req, res, next) {
    try { res.json({ data: await this.svc.listSpecialties() }); }
    catch (e) { next(e); }
  }

  async getDoctors(req, res, next) {
    try {
      const { specialty } = req.query;
      res.json({ data: await this.svc.listDoctorsBySpecialty(specialty) });
    } catch (e) { next(e); }
  }

  async getSlots(req, res, next) {
  try {
    const { doctorId, date } = req.query;  // date = "YYYY-MM-DD"
    const data = await this.svc.listSlots({ doctorId, dateISO: date });
    res.json({ data });
  } catch (e) { next(e); }
  }


  async postHold(req, res, next) {
    try {
      const { slotId } = req.body;
      res.json({ data: await this.svc.holdSlot({ slotId }) });
    } catch (e) { next(e); }
  }

  async postCreate(req, res, next) {
    try {
      const { doctorId, slotId } = req.body;
      const patientId = req.user?._id;
      if (!patientId) throw new AppError("Unauthorized", 401);
      const appt = await this.svc.createAppointment({ patientId, doctorId, slotId });
      res.status(201).json({ data: appt });
    } catch (e) { next(e); }
  }

  async postPay(req, res, next) {
    try {
      const { appointmentId } = req.body;
      res.json({ data: await this.svc.payAndConfirm({ appointmentId }) });
    } catch (e) { next(e); }
  }
}
