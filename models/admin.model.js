import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    adminLevel: {
      type: String,
      enum: ["SUPER_ADMIN", "HOSPITAL_ADMIN"],
      default: "HOSPITAL_ADMIN",
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model("Admin", adminSchema);