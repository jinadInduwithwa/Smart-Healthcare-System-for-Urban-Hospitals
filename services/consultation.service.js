import { Consultation } from "../models/consultation.model.js";
import { User } from "../models/user.model.js";
import { Patient } from "../models/patient.model.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";
import { validateDiagnosisCode, searchDiagnosisCodes } from "../utils/icd.helper.js";
import { validateTestName, searchTestNames } from "../utils/test.helper.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ConsultationService {
  constructor() {
    this.addConsultation = this.addConsultation.bind(this);
    this.getAllPatients = this.getAllPatients.bind(this);
    this.searchDiagnosisCodes = this.searchDiagnosisCodes.bind(this);
    this.searchTestNames = this.searchTestNames.bind(this);
    this.searchDrugs = this.searchDrugs.bind(this);
    this.getConsultationsByPatient = this.getConsultationsByPatient.bind(this);
    this.updateConsultation = this.updateConsultation.bind(this);
    this.deleteConsultation = this.deleteConsultation.bind(this);
    this.addMedicalReport = this.addMedicalReport.bind(this);
    this.removeMedicalReport = this.removeMedicalReport.bind(this);
    
    // Load diagnosis codes and recommended tests data
    this.diagnosisCodes = this.loadDiagnosisCodes();
    this.recommendedTests = this.loadRecommendedTests();
    this.drugs = this.loadDrugs();
  }

  loadDiagnosisCodes() {
    try {
      const dataPath = path.join(__dirname, "..", "data", "diagnosis_codes.json");
      const rawData = fs.readFileSync(dataPath, "utf8");
      return JSON.parse(rawData);
    } catch (error) {
      logger.error("Failed to load diagnosis codes", { error: error.message });
      return [];
    }
  }

  loadRecommendedTests() {
    try {
      const dataPath = path.join(__dirname, "..", "data", "recommended_tests.json");
      const rawData = fs.readFileSync(dataPath, "utf8");
      return JSON.parse(rawData);
    } catch (error) {
      logger.error("Failed to load recommended tests", { error: error.message });
      return [];
    }
  }

  loadDrugs() {
    try {
      const dataPath = path.join(__dirname, "..", "data", "drugs.json");
      const rawData = fs.readFileSync(dataPath, "utf8");
      return JSON.parse(rawData);
    } catch (error) {
      logger.error("Failed to load drugs data", { error: error.message });
      return [];
    }
  }

  async getAllPatients() {
    try {
      logger.info("Fetching all patients");

      const patients = await Patient.find()
        .populate({
          path: "userId",
          select: "email firstName lastName address phone isActive role",
          match: { isActive: true, role: "PATIENT" },
        })
        .lean();

      // Filter out patients where userId is null (i.e., inactive users or non-patients)
      const activePatients = patients.filter((patient) => patient.userId);

      if (!activePatients.length) {
        logger.warn("No active patients found");
        throw new AppError("No active patients found", 404);
      }

      logger.info("Retrieved all patients", { count: activePatients.length });

      return {
        data: activePatients,
        message: "Patients retrieved successfully",
      };
    } catch (error) {
      logger.error("Error fetching all patients", { error: error.message });
      throw error instanceof AppError ? error : new AppError("Failed to retrieve patients", 500);
    }
  }

  async addConsultation(consultationData, user) {
    try {
      logger.info("Attempting to create consultation", {
        userId: user._id,
        patientId: consultationData.patient,
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
        patient,
        consultationDate,
        diagnosis = [],
        clinicalNotes = {},
        medications = [],
        recommendedTests = [],
        status = "SCHEDULED",
      } = consultationData;

      if (!patient || !consultationDate) {
        logger.error("Missing required fields", { patientId: patient, consultationDate });
        throw new AppError("Patient ID and consultation date are required", 400);
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(patient)) {
        logger.error("Invalid patient ID format", { patientId: patient });
        throw new AppError("Invalid patient ID format", 400);
      }

      // NOTE: Patient validation has been removed as requested
      // The patient ID is assumed to be valid

      // Validate diagnosis codes
      const validatedDiagnoses = [];
      if (diagnosis.length > 0) {
        for (const diag of diagnosis) {
          const { code, description } = await validateDiagnosisCode(diag.code);
          validatedDiagnoses.push({
            code,
            description: diag.description || description,
          });
        }
      }

      // Validate recommended tests
      const validatedTests = [];
      if (recommendedTests.length > 0) {
        for (const test of recommendedTests) {
          const { name } = await validateTestName(test);
          validatedTests.push(name);
        }
      }

      // Create consultation object
      const consultation = new Consultation({
        patient: patient,
        doctor: user._id,
        consultationDate: new Date(consultationDate),
        diagnosis: validatedDiagnoses,
        clinicalNotes,
        medications,
        recommendedTests: validatedTests,
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
      
      if (!query) {
        throw new AppError("Query parameter is required", 400);
      }

      // Filter diagnosis codes based on query
      const filteredCodes = this.diagnosisCodes.filter(code => 
        code.code.toLowerCase().includes(query.toLowerCase()) ||
        code.name.toLowerCase().includes(query.toLowerCase()) ||
        code.description.toLowerCase().includes(query.toLowerCase())
      );

      // Limit results
      const results = filteredCodes.slice(0, maxResults);

      return {
        success: true,
        data: {
          results,
          total: results.length
        },
        message: results.length > 0 ? `Found ${results.length} matching ICD-10 codes` : "No matching codes found",
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

  async searchTestNames(query, maxResults = 10) {
    try {
      logger.info("Searching test names", { query, maxResults });
      
      if (!query) {
        throw new AppError("Query parameter is required", 400);
      }

      // Filter test names based on query
      const filteredTests = this.recommendedTests.filter(test => 
        test.name.toLowerCase().includes(query.toLowerCase()) ||
        test.description.toLowerCase().includes(query.toLowerCase())
      );

      // Limit results
      const results = filteredTests.slice(0, maxResults);

      return {
        success: true,
        data: {
          results,
          total: results.length
        },
        message: results.length > 0 ? `Found ${results.length} matching test names` : "No matching tests found",
      };
    } catch (error) {
      logger.error("Failed to search test names", {
        query,
        error: error.message,
      });
      throw new AppError(
        error.message || "Failed to search test names",
        error.statusCode || 500
      );
    }
  }

  async searchDrugs(query, maxResults = 10) {
    try {
      logger.info("Searching drugs", { query, maxResults });
      
      if (!query) {
        throw new AppError("Query parameter is required", 400);
      }

      // Filter drugs based on query
      const filteredDrugs = this.drugs.filter(drug => 
        drug.name.toLowerCase().includes(query.toLowerCase())
      );

      // Limit results
      const results = filteredDrugs.slice(0, maxResults);

      return {
        success: true,
        data: {
          results,
          total: results.length
        },
        message: results.length > 0 ? `Found ${results.length} matching drugs` : "No matching drugs found",
      };
    } catch (error) {
      logger.error("Failed to search drugs", {
        query,
        error: error.message,
      });
      throw new AppError(
        error.message || "Failed to search drugs",
        error.statusCode || 500
      );
    }
  }

  async getConsultationsByPatient(patientId, user) {
    try {
      logger.info("Fetching consultations for patient", { patientId, userId: user._id });

      // Validate patient ID
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        throw new AppError("Invalid patient ID format", 400);
      }

      // Ensure the user is the patient or a doctor
      if (user.role !== "DOCTOR" && user._id.toString() !== patientId) {
        throw new AppError("Unauthorized to view consultations", 403);
      }

      const consultations = await Consultation.find({ patient: patientId, deletedAt: null })
        .populate("patient", "name email _id")  // Include _id in the populated fields
        .populate("doctor", "name email _id")   // Include _id in the populated fields
        .sort({ consultationDate: -1 })
        .exec();

      logger.info(`Found ${consultations.length} consultations for patient ${patientId}`);

      return {
        success: true,
        data: consultations,
        message: "Consultations fetched successfully",
      };
    } catch (error) {
      logger.error("Failed to fetch consultations", { patientId, error: error.message });
      throw new AppError(error.message || "Failed to fetch consultations", error.statusCode || 500);
    }
  }

  async updateConsultation(id, consultationData, user) {
    try {
      logger.info("Attempting to update consultation", { id, userId: user._id });

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid consultation ID format", 400);
      }

      const consultation = await Consultation.findById(id);
      if (!consultation || consultation.deletedAt) {
        throw new AppError("Consultation not found", 404);
      }

      // Ensure only the creating doctor can update
      if (user.role !== "DOCTOR" || consultation.doctor.toString() !== user._id.toString()) {
        throw new AppError("Unauthorized to update this consultation", 403);
      }

      // Update fields
      if (consultationData.consultationDate) consultation.consultationDate = new Date(consultationData.consultationDate);
      if (consultationData.status) consultation.status = consultationData.status;
      if (consultationData.diagnosis) {
        consultation.diagnosis = [];
        for (const diag of consultationData.diagnosis) {
          const { code, description } = await validateDiagnosisCode(diag.code);
          consultation.diagnosis.push({ code, description: diag.description || description });
        }
      }
      if (consultationData.clinicalNotes) consultation.clinicalNotes = consultationData.clinicalNotes;
      if (consultationData.medications) consultation.medications = consultationData.medications;
      if (consultationData.recommendedTests) {
        consultation.recommendedTests = [];
        for (const test of consultationData.recommendedTests) {
          const { name } = await validateTestName(test);
          consultation.recommendedTests.push(name);
        }
      }

      // Add audit entry without saving
      consultation.addAuditEntry("UPDATED", user._id, consultationData);

      // Save all changes at once
      const updatedConsultation = await consultation.save();

      // Populate patient and doctor fields
      const populatedConsultation = await Consultation.findById(updatedConsultation._id)
        .populate("patient", "name email")
        .populate("doctor", "name email")
        .exec();

      logger.info("Consultation updated successfully", { id });

      return {
        success: true,
        data: populatedConsultation,
        message: "Consultation updated successfully",
      };
    } catch (error) {
      logger.error("Failed to update consultation", { id, error: error.message });
      throw new AppError(error.message || "Failed to update consultation", error.statusCode || 500);
    }
  }

  async deleteConsultation(id, user) {
    try {
      logger.info("Attempting to delete consultation", { id, userId: user._id });

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid consultation ID format", 400);
      }

      const consultation = await Consultation.findById(id);
      if (!consultation || consultation.deletedAt) {
        throw new AppError("Consultation not found", 404);
      }

      // Ensure only the creating doctor can delete
      if (user.role !== "DOCTOR" || consultation.doctor.toString() !== user._id.toString()) {
        throw new AppError("Unauthorized to delete this consultation", 403);
      }

      // Delete medical reports from Cloudinary
      if (consultation.medicalReports && consultation.medicalReports.length > 0) {
        for (const report of consultation.medicalReports) {
          try {
            await deleteFromCloudinary(report.publicId);
          } catch (error) {
            logger.error("Failed to delete medical report from Cloudinary", {
              publicId: report.publicId,
              error: error.message
            });
          }
        }
      }

      // Mark as deleted
      consultation.deletedAt = new Date();

      // Add audit entry without saving
      consultation.addAuditEntry("DELETED", user._id, { deletedAt: consultation.deletedAt });

      // Save all changes at once
      await consultation.save();

      logger.info("Consultation deleted successfully", { id });

      return {
        success: true,
        data: null,
        message: "Consultation deleted successfully",
      };
    } catch (error) {
      logger.error("Failed to delete consultation", { id, error: error.message });
      throw new AppError(error.message || "Failed to delete consultation", error.statusCode || 500);
    }
  }

  /**
   * Add a medical report to a consultation
   * @param {string} consultationId - The ID of the consultation
   * @param {Object} user - The authenticated user
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} originalname - The original filename
   * @returns {Promise<Object>} - The updated consultation
   */
  async addMedicalReport(consultationId, user, fileBuffer, originalname) {
    try {
      logger.info("Attempting to add medical report", { consultationId, userId: user._id });

      if (!mongoose.Types.ObjectId.isValid(consultationId)) {
        throw new AppError("Invalid consultation ID format", 400);
      }

      const consultation = await Consultation.findById(consultationId);
      if (!consultation || consultation.deletedAt) {
        throw new AppError("Consultation not found", 404);
      }

      // Ensure only the creating doctor can add reports
      if (user.role !== "DOCTOR" || consultation.doctor.toString() !== user._id.toString()) {
        throw new AppError("Unauthorized to add medical report to this consultation", 403);
      }

      // Upload file to Cloudinary
      const uploadResult = await uploadToCloudinary(fileBuffer, originalname);

      // Add report to consultation
      consultation.medicalReports = consultation.medicalReports || [];
      consultation.medicalReports.push({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileName: originalname,
        uploadedAt: new Date(),
      });

      // Add audit entry
      consultation.addAuditEntry("UPDATED", user._id, { 
        action: "ADD_MEDICAL_REPORT",
        fileName: originalname
      });

      // Save consultation
      const updatedConsultation = await consultation.save();

      // Populate patient and doctor fields
      const populatedConsultation = await Consultation.findById(updatedConsultation._id)
        .populate("patient", "name email")
        .populate("doctor", "name email")
        .exec();

      logger.info("Medical report added successfully", { consultationId });

      return {
        success: true,
        data: populatedConsultation,
        message: "Medical report added successfully",
      };
    } catch (error) {
      logger.error("Failed to add medical report", { consultationId, error: error.message });
      throw new AppError(error.message || "Failed to add medical report", error.statusCode || 500);
    }
  }

  /**
   * Remove a medical report from a consultation
   * @param {string} consultationId - The ID of the consultation
   * @param {string} reportId - The ID of the report to remove
   * @param {Object} user - The authenticated user
   * @returns {Promise<Object>} - The updated consultation
   */
  async removeMedicalReport(consultationId, reportId, user) {
    try {
      logger.info("Attempting to remove medical report", { consultationId, reportId, userId: user._id });

      if (!mongoose.Types.ObjectId.isValid(consultationId)) {
        throw new AppError("Invalid consultation ID format", 400);
      }

      const consultation = await Consultation.findById(consultationId);
      if (!consultation || consultation.deletedAt) {
        throw new AppError("Consultation not found", 404);
      }

      // Ensure only the creating doctor can remove reports
      if (user.role !== "DOCTOR" || consultation.doctor.toString() !== user._id.toString()) {
        throw new AppError("Unauthorized to remove medical report from this consultation", 403);
      }

      // Find the report
      const reportIndex = consultation.medicalReports.findIndex(
        report => report._id.toString() === reportId
      );

      if (reportIndex === -1) {
        throw new AppError("Medical report not found", 404);
      }

      const report = consultation.medicalReports[reportIndex];

      // Delete file from Cloudinary
      try {
        await deleteFromCloudinary(report.publicId);
      } catch (error) {
        logger.error("Failed to delete medical report from Cloudinary", {
          publicId: report.publicId,
          error: error.message
        });
      }

      // Remove report from consultation
      consultation.medicalReports.splice(reportIndex, 1);

      // Add audit entry
      consultation.addAuditEntry("UPDATED", user._id, { 
        action: "REMOVE_MEDICAL_REPORT",
        fileName: report.fileName
      });

      // Save consultation
      const updatedConsultation = await consultation.save();

      // Populate patient and doctor fields
      const populatedConsultation = await Consultation.findById(updatedConsultation._id)
        .populate("patient", "name email")
        .populate("doctor", "name email")
        .exec();

      logger.info("Medical report removed successfully", { consultationId, reportId });

      return {
        success: true,
        data: populatedConsultation,
        message: "Medical report removed successfully",
      };
    } catch (error) {
      logger.error("Failed to remove medical report", { consultationId, reportId, error: error.message });
      throw new AppError(error.message || "Failed to remove medical report", error.statusCode || 500);
    }
  }
}