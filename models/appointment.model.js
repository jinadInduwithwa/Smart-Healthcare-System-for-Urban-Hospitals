// // models/appointment.model.js
// import mongoose from "mongoose";

// const s = new mongoose.Schema(
//   {
//     patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
//     availability: { type: mongoose.Schema.Types.ObjectId, ref: "Availability", required: true },
//     status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED"], default: "PENDING" },
//     amountCents: { type: Number, default: 250000 },
//     payment: { type: Object, default: {} },
//   },
//   { timestamps: true }
// );

// s.index({ patient: 1, createdAt: -1 });

// export const Appointment = mongoose.model("Appointment", s);

import mongoose from "mongoose";

const s = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    availability: { type: mongoose.Schema.Types.ObjectId, ref: "Availability", required: true },
    status: { 
      type: String, 
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"], 
      default: "PENDING" 
    },
    amountCents: { type: Number, default: 250000 },
    payment: { type: Object, default: {} },
  },
  { timestamps: true }
);

s.index({ patient: 1, createdAt: -1 });

export const Appointment = mongoose.model("Appointment", s);