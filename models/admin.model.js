import mongoose from "mongoose";
import { User } from "./user.model.js";

const adminSchema = new mongoose.Schema({
  adminLevel: {
    type: String,
    enum: ["SUPER_ADMIN", "HOSPITAL_ADMIN"],
    default: "HOSPITAL_ADMIN",
  },
});

export const Admin = User.discriminator("ADMIN", adminSchema);