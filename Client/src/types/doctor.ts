// Doctor-related types for the healthcare system

export interface Diagnosis {
  code: string;
  description?: string;
}

export interface ClinicalNotes {
  subjective: string;
  objective: string;
}

export interface Medication {
  drug: string;
  dosage: string;
  frequency: string;
}

export interface MedicalReport {
  _id: string;
  url: string;
  publicId: string;
  fileName: string;
  uploadedAt: string;
}

export interface Consultation {
  _id: string;
  patientId: string;
  consultationDate: string;
  diagnosis: Diagnosis[];
  clinicalNotes: ClinicalNotes;
  medications: Medication[];
  recommendedTests: string[];
  status: string;
  medicalReports: MedicalReport[];
  patient?: string | { _id: string };
  doctor?: string;
}