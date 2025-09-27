import mongoose from "mongoose";
import { User } from "./user.model.js";

const patientSchema = new mongoose.Schema({
  healthCardId: {
    type: String,
    unique: true,
    sparse: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Date of birth is required"],
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: [true, "Gender is required"],
  },
});

export const Patient = User.discriminator("PATIENT", patientSchema);
