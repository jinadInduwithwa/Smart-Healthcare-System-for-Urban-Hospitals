import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // role: PATIENT
    doctor:  { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    availability: { type: mongoose.Schema.Types.ObjectId, ref: "Availability", required: true, unique: true },
    status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED"], default: "PENDING" },
    amountCents: { type: Number, required: true },
    payment: {
      provider: { type: String, default: "MockGateway" },
      status:   { type: String, enum: ["NONE", "SUCCESS", "FAILED"], default: "NONE" },
      txnRef:   { type: String, default: null },
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
