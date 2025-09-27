import mongoose from "mongoose";
import { User } from "./user.model.js";

const doctorSchema = new mongoose.Schema({
  specialization: {
    type: String,
    required: [true, "Specialization is required"],
    trim: true,
  },
  licenseNumber: {
    type: String,
    required: [true, "License number is required"],
    unique: true,
    trim: true,
  },
});

export const Doctor = User.discriminator("DOCTOR", doctorSchema);