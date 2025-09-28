import { Consultation } from "../models/consultation.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import { validateDiagnosisCode, searchDiagnosisCodes } from "../utils/icd.helper.js";

export class ConsultationService {
  constructor() {
    this.addConsultation = this.addConsultation.bind(this);
    this.searchDiagnosisCodes = this.searchDiagnosisCodes.bind(this);
  }

  async addConsultation(consultationData, user) {
    try {
      logger.info("Attempting to create consultation", {
        userId: user._id,
        patientId: consultationData.patientId,
      });

      // Ensure the user is a doctor
      if (user.role !== "DOCTOR") {
        logger.warn("Unauthorized attempt to create consultation", {
          userId: user._id,
          role: user.role,
        });
        throw new AppError("Only doctors can create consultations", 403);
      }

      // Validate required fields
      const {
        patientId,
        consultationDate,
        diagnosis = [],
        clinicalNotes = {},
        medications = [],
        recommendedTests = [],
        status = "SCHEDULED",
      } = consultationData;

      if (!patientId || !consultationDate) {
        logger.error("Missing required fields", { patientId, consultationDate });
        throw new AppError("Patient ID and consultation date are required", 400);
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        logger.error("Invalid patient ID format", { patientId });
        throw new AppError("Invalid patient ID format", 400);
      }

      // Verify patient exists and has correct role
      const patient = await User.findById(patientId);
      if (!patient || patient.role !== "PATIENT") {
        logger.error("Invalid patient ID or role", { patientId });
        throw new AppError("Invalid patient ID or role", 400);
      }

      // Validate and fetch diagnosis codes using local dataset
      const validatedDiagnoses = [];
      if (diagnosis.length > 0) {
        for (const diag of diagnosis) {
          const { code, description } = await validateDiagnosisCode(diag.code);
          validatedDiagnoses.push({
            code,
            description: diag.description || description, // Use provided or dataset description
          });
        }
      }

      // Create consultation object
      const consultation = new Consultation({
        patient: patientId,
        doctor: user._id,
        consultationDate: new Date(consultationDate),
        diagnosis: validatedDiagnoses,
        clinicalNotes,
        medications,
        recommendedTests,
        status,
      });

      // Save consultation
      const savedConsultation = await consultation.save();

      // Populate patient and doctor fields
      const populatedConsultation = await Consultation.findById(savedConsultation._id)
        .populate("patient", "name email")
        .populate("doctor", "name email")
        .exec();

      logger.info("Consultation created successfully", {
        consultationId: savedConsultation._id,
      });

      return {
        success: true,
        data: populatedConsultation,
        message: "Consultation created successfully",
      };
    } catch (error) {
      logger.error("Failed to create consultation", {
        userId: user._id,
        error: error.message,
      });
      throw new AppError(
        error.message || "Failed to create consultation",
        error.statusCode || 500
      );
    }
  }

  async searchDiagnosisCodes(query, maxResults = 10) {
    try {
      logger.info("Searching diagnosis codes", { query, maxResults });
      const results = await searchDiagnosisCodes(query, maxResults);
      return {
        success: true,
        data: results,
        message: results.total > 0 ? `Found ${results.total} matching ICD-10 codes` : "No matching codes found",
      };
    } catch (error) {
      logger.error("Failed to search diagnosis codes", {
        query,
        error: error.message,
      });
      throw new AppError(
        error.message || "Failed to search diagnosis codes",
        error.statusCode || 500
      );
    }
  }
}