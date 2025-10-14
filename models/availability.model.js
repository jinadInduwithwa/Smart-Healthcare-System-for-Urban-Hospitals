// models/availability.model.js
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },          // midnight ISO
    startTime: { type: String, required: true },   // "HH:mm"
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

schema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

export const Availability = mongoose.model("Availability", schema);