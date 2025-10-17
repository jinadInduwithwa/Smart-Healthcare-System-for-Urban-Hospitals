import mongoose from "mongoose";
import { Consultation } from "../models/consultation.model.js";
import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js";

/**
 * Returns completed (or all non-deleted) consultations for a given patient userId,
 * sorted newest first, with helpful doctor and user fields populated.
 */
export const getMedicalHistoryByUserId = async (userId) => {
  const id = new mongoose.Types.ObjectId(String(userId));

  // We store patient/doctor as User _id in Consultation per your schema
  const query = {
    patient: id,
    deletedAt: null,
  };

  const docs = await Consultation.find(query)
    .sort({ consultationDate: -1, createdAt: -1 })
    .populate({
      path: "doctor",
      model: User, // doctor stored as User ref in your Consultation schema
      select: "firstName lastName name email avatarUrl",
    })
    .lean();

  // Light transform for frontend convenience
  return docs.map((c) => ({
    id: c._id,
    consultationDate: c.consultationDate,
    status: c.status,
    doctor: c.doctor
      ? {
          id: c.doctor._id,
          name:
            [c.doctor.firstName, c.doctor.lastName].filter(Boolean).join(" ").trim() ||
            c.doctor.name ||
            c.doctor.email,
          email: c.doctor.email || null,
          avatarUrl: c.doctor.avatarUrl || null,
        }
      : null,
    diagnosis: (c.diagnosis || []).map((d) => ({
      code: d.code,
      description: d.description,
    })),
    clinicalNotes: c.clinicalNotes || {},
    medications: c.medications || [],
    recommendedTests: c.recommendedTests || [],
    medicalReports: c.medicalReports || [],
    updatedAt: c.updatedAt,
    createdAt: c.createdAt,
  }));
};
