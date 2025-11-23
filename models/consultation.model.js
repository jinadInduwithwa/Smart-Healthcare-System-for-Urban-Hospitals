import mongoose from "mongoose";
import { User } from "./user.model.js";
// Import for type definitions, but we'll use local validation
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const consultationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: [true, "Patient ID is required"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: [true, "Doctor ID is required"],
    },
    consultationDate: {
      type: Date,
      required: [true, "Consultation date is required"],
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
      required: true,
    },
    diagnosis: [
      {
        code: {
          type: String,
          trim: true,
          required: [true, "Diagnosis code is required"],
        },
        description: {
          type: String,
          trim: true,
          required: [true, "Diagnosis description is required"],
        },
      },
    ],
    clinicalNotes: {
      subjective: {
        type: String,
        trim: true,
      },
      objective: {
        type: String,
        trim: true,
      },
    },
    medications: [
      {
        drug: {
          type: String,
          required: [true, "Drug name is required"],
          trim: true,
        },
        dosage: {
          type: String,
          required: [true, "Dosage is required"],
          trim: true,
        },
        frequency: {
          type: String,
          required: [true, "Frequency is required"],
          trim: true,
        },
      },
    ],
    recommendedTests: [
      {
        type: String,
        trim: true,
      },
    ],
    // New field for medical reports
    medicalReports: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    auditTrail: [
      {
        action: {
          type: String,
          enum: ["CREATED", "UPDATED", "DELETED", "VIEWED"],
          required: true,
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        changes: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
consultationSchema.index({ patient: 1, consultationDate: -1 });
consultationSchema.index({ doctor: 1, consultationDate: -1 });

// Pre-save validation hook
consultationSchema.pre("save", async function (next) {
  try {
    // NOTE: Patient and doctor role validation has been removed as requested
    // The IDs are assumed to be valid

    // Validate diagnoses with local dataset
    if (this.diagnosis && this.diagnosis.length > 0) {
      // Load diagnosis codes data
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const dataPath = path.join(__dirname, "..", "data", "diagnosis_codes.json");
      let diagnosisCodes = [];
      try {
        const rawData = fs.readFileSync(dataPath, "utf8");
        diagnosisCodes = JSON.parse(rawData);
      } catch (error) {
        return next(new Error(`Failed to load diagnosis codes: ${error.message}`));
      }
      
      for (const diag of this.diagnosis) {
        // Find the diagnosis code in our local data
        const foundCode = diagnosisCodes.find(code => code.code === diag.code);
        if (!foundCode) {
          return next(new Error(`Invalid diagnosis code: ${diag.code}`));
        }
        // Update description if not provided
        if (!diag.description) {
          diag.description = foundCode.description || foundCode.name;
        }
      }
    }

    // Validate medications
    if (this.medications && this.medications.length > 0) {
      for (const med of this.medications) {
        if (!med.drug || !med.dosage || !med.frequency) {
          return next(new Error("All medication fields (drug, dosage, frequency) are required"));
        }
      }
    }

    // Add initial audit trail entry if new document
    if (this.isNew) {
      this.auditTrail = [
        {
          action: "CREATED",
          performedBy: this.doctor,
          timestamp: new Date(),
        },
      ];
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to add audit trail for updates
consultationSchema.methods.addAuditEntry = function (action, performedBy, changes) {
  this.auditTrail.push({
    action,
    performedBy,
    timestamp: new Date(),
    changes,
  });
  // Remove the save() call to avoid multiple saves
};

export const Consultation = mongoose.model("Consultation", consultationSchema);