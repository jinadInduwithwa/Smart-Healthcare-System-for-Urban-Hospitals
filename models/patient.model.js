import mongoose from "mongoose";

// Function to generate a unique healthCardId
async function generateHealthCardId() {
  const prefix = "HC";
  const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  const healthCardId = `${prefix}-${randomNum}`;

  // Check if the generated ID already exists
  const existingPatient = await Patient.findOne({ healthCardId });
  if (existingPatient) {
    // Recursively try again if ID exists
    return generateHealthCardId();
  }
  return healthCardId;
}

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
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
  },
  { timestamps: true }
);

// Pre-save hook to auto-generate healthCardId if not provided
patientSchema.pre("save", async function (next) {
  if (this.isNew && !this.healthCardId) {
    try {
      this.healthCardId = await generateHealthCardId();
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export const Patient = mongoose.model("Patient", patientSchema);