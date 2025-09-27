// auth-service/src/models/consultation.model.js
import mongoose from "mongoose";
import { User } from "./user.model.js"; // Assuming User is the base model for Patient and Doctor

const consultationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References User model (with role: "PATIENT")
      required: [true, "Patient ID is required"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References User model (with role: "DOCTOR")
      required: [true, "Doctor ID is required"],
    },
    diagnosis: {
      code: {
        type: String, // e.g., ICD-10 code like "A00.0"
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
    },
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
          enum: ["CREATED", "UPDATED"], // Can expand for more actions
          required: true,
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // References the user who performed the action
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        changes: {
          type: mongoose.Schema.Types.Mixed, // Optional: Store diff of changes
        },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save validation hook (e.g., for data completeness and correctness)
consultationSchema.pre("save", async function (next) {
  // Validate diagnosis if provided
  if (this.diagnosis && this.diagnosis.code) {
    // Optional: Add ICD-10 validation logic here (e.g., regex or external check)
    if (!/^[A-Z]\d{2}(\.\d{1,2})?$/.test(this.diagnosis.code)) {
      return next(new Error("Invalid ICD-10 code format"));
    }
  }

  // Validate medications
  if (this.medications && this.medications.length > 0) {
    for (const med of this.medications) {
      if (!med.drug || !med.dosage || !med.frequency) {
        return next(new Error("All medication fields (drug, dosage, frequency) are required"));
      }
      // Optional: Add dosage validation (e.g., regex for "500mg")
    }
  }

  // Add initial audit trail entry if new document
  if (this.isNew) {
    this.auditTrail = [
      {
        action: "CREATED",
        performedBy: this.doctor, // Assuming doctor is the creator
        timestamp: new Date(),
      },
    ];
  }

  next();
});

// Optional: Method to add audit trail for updates
consultationSchema.methods.addAuditEntry = async function (action, performedBy, changes) {
  this.auditTrail.push({
    action,
    performedBy,
    timestamp: new Date(),
    changes,
  });
  await this.save();
};

export const Consultation = mongoose.model("Consultation", consultationSchema);