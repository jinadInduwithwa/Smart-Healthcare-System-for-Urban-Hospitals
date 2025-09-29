import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    // Store the calendar day at midnight (no time-of-day)
    date:     { type: Date, required: true },       // e.g., 2025-09-29T00:00:00.000Z
    startTime:{ type: String, required: true },     // "15:30"
    endTime:  { type: String, required: true },     // "16:00"
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Avoid duplicates and make lookups fast
availabilitySchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

export const Availability = mongoose.model("Availability", availabilitySchema);
