import mongoose from "mongoose";
import { User } from "./user.model.js";
import { validateDiagnosisCode } from "../utils/icd.helper.js";

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
    // Validate patient and doctor roles
    const patient = await User.findById(this.patient);
    if (!patient || patient.role !== "PATIENT") {
      return next(new Error("Invalid patient ID or role"));
    }
    const doctor = await User.findById(this.doctor);
    if (!doctor || doctor.role !== "DOCTOR") {
      return next(new Error("Invalid doctor ID or role"));
    }

    // Validate diagnoses with local dataset
    if (this.diagnosis && this.diagnosis.length > 0) {
      for (const diag of this.diagnosis) {
        const { valid, description } = await validateDiagnosisCode(diag.code);
        if (!valid) {
          return next(new Error(`Invalid ICD-10 code: ${diag.code}`));
        }
        // Update description if not provided
        if (!diag.description) {
          diag.description = description;
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