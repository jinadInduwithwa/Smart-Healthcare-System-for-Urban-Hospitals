import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

// Define interfaces based on Mongoose schema
interface Diagnosis {
  code: string;
  description: string;
}

interface ClinicalNotes {
  subjective: string;
  objective: string;
}

interface Medication {
  drug: string;
  dosage: string;
  frequency: string;
}

interface ConsultationForm {
  patient: string;
  doctor: string;
  consultationDate: string;
  diagnosis: Diagnosis[];
  clinicalNotes: ClinicalNotes;
  medications: Medication[];
  recommendedTests: string[];
}

// Mock user data for patient and doctor display
const mockUsers = [
  { _id: '68d895b03c66b57875a7b035', name: 'John Doe', role: 'PATIENT' },
  { _id: '68d895b03c66b57875a7b036', name: 'Jane Smith', role: 'PATIENT' },
  { _id: '68d895b03c66b57875a7b038', name: 'Dr. Bob Wilson', role: 'DOCTOR' },
];

// Mock logged-in doctor
const loggedInDoctor = { _id: '68d895b03c66b57875a7b038', name: 'Dr. Bob Wilson', role: 'DOCTOR' };

// Mock ICD-10 validation
const validateDiagnosisCode = async (code: string) => {
  // Simulate async validation
  return { valid: true, description: code === 'J45' ? 'Asthma' : 'Unknown' };
};

const AddConsultation: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [formData, setFormData] = useState<ConsultationForm>({
    patient: patientId || '',
    doctor: loggedInDoctor._id,
    consultationDate: '',
    diagnosis: [{ code: '', description: '' }],
    clinicalNotes: { subjective: '', objective: '' },
    medications: [{ drug: '', dosage: '', frequency: '' }],
    recommendedTests: [''],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = async () => {
    const newErrors: { [key: string]: string } = {};

    // Validate patient and doctor (non-editable, but check existence)
    if (!formData.patient || !mockUsers.find(u => u._id === formData.patient && u.role === 'PATIENT')) {
      newErrors.patient = 'Invalid patient ID or role';
    }
    if (!formData.doctor || !mockUsers.find(u => u._id === formData.doctor && u.role === 'DOCTOR')) {
      newErrors.doctor = 'Invalid doctor ID or role';
    }
    if (!formData.consultationDate) newErrors.consultationDate = 'Consultation date is required';

    // Validate diagnosis
    for (let i = 0; i < formData.diagnosis.length; i++) {
      const diag = formData.diagnosis[i];
      if (!diag.code) newErrors[`diagnosis[${i}].code`] = 'Diagnosis code is required';
      else {
        const { valid } = await validateDiagnosisCode(diag.code);
        if (!valid) newErrors[`diagnosis[${i}].code`] = `Invalid ICD-10 code: ${diag.code}`;
      }
      if (!diag.description) newErrors[`diagnosis[${i}].description`] = 'Diagnosis description is required';
    }

    // Validate medications
    for (let i = 0; i < formData.medications.length; i++) {
      const med = formData.medications[i];
      if (!med.drug) newErrors[`medications[${i}].drug`] = 'Drug name is required';
      if (!med.dosage) newErrors[`medications[${i}].dosage`] = 'Dosage is required';
      if (!med.frequency) newErrors[`medications[${i}].frequency`] = 'Frequency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDiagnosisChange = (index: number, field: string, value: string) => {
    const newDiagnosis = [...formData.diagnosis];
    newDiagnosis[index] = { ...newDiagnosis[index], [field]: value };
    setFormData(prev => ({ ...prev, diagnosis: newDiagnosis }));
    setErrors(prev => ({ ...prev, [`diagnosis[${index}].${field}`]: '' }));
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const newMedications = [...formData.medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setFormData(prev => ({ ...prev, medications: newMedications }));
    setErrors(prev => ({ ...prev, [`medications[${index}].${field}`]: '' }));
  };

  const handleTestChange = (index: number, value: string) => {
    const newTests = [...formData.recommendedTests];
    newTests[index] = value;
    setFormData(prev => ({ ...prev, recommendedTests: newTests }));
  };

  const addDiagnosis = () => {
    setFormData(prev => ({
      ...prev,
      diagnosis: [...prev.diagnosis, { code: '', description: '' }],
    }));
  };

  const removeDiagnosis = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diagnosis: prev.diagnosis.filter((_, i) => i !== index),
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`diagnosis[${index}].code`];
      delete newErrors[`diagnosis[${index}].description`];
      return newErrors;
    });
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { drug: '', dosage: '', frequency: '' }],
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`medications[${index}].drug`];
      delete newErrors[`medications[${index}].dosage`];
      delete newErrors[`medications[${index}].frequency`];
      return newErrors;
    });
  };

  const addTest = () => {
    setFormData(prev => ({
      ...prev,
      recommendedTests: [...prev.recommendedTests, ''],
    }));
  };

  const removeTest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recommendedTests: prev.recommendedTests.filter((_, i) => i !== index),
    }));
  };

  const setDateToNow = () => {
    const now = new Date('2025-09-28T14:56:00+05:30').toISOString().split('.')[0];
    setFormData(prev => ({ ...prev, consultationDate: now }));
    setErrors(prev => ({ ...prev, consultationDate: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (isValid) {
      const submissionData = {
        ...formData,
        auditTrail: [
          {
            action: 'CREATED',
            performedBy: formData.doctor,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      console.log('Form submitted:', submissionData);
      // Replace with API call to save to MongoDB
      // Example: await axios.post('/api/consultations', submissionData);
    }
  };

  const patientName = mockUsers.find(u => u._id === formData.patient)?.name || 'Unknown Patient';
  const doctorName = mockUsers.find(u => u._id === formData.doctor)?.name || 'Unknown Doctor';
  const formattedDate = formData.consultationDate
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      }).format(new Date(formData.consultationDate))
    : 'Not set';

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-600 dark:text-blue-300">
        Add New Consultation
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient and Doctor Section */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Patient and Doctor
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Patient
              </label>
              <p className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm sm:text-base">
                {patientName}
              </p>
              {errors.patient && (
                <p className="text-red-500 text-xs mt-1">{errors.patient}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Doctor
              </label>
              <p className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm sm:text-base">
                {doctorName}
              </p>
              {errors.doctor && (
                <p className="text-red-500 text-xs mt-1">{errors.doctor}</p>
              )}
            </div>
          </div>
        </div>

        {/* Consultation Details Section */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Consultation Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Consultation Date
              </label>
              <div className="flex items-center space-x-4">
                <p className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm sm:text-base flex-1">
                  {formattedDate}
                </p>
                <button
                  type="button"
                  onClick={setDateToNow}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm"
                >
                  Set to Now
                </button>
              </div>
              {errors.consultationDate && (
                <p className="text-red-500 text-xs mt-1">{errors.consultationDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Diagnosis Section */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Diagnosis
          </h3>
          {formData.diagnosis.map((diag, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={diag.code}
                  onChange={e => handleDiagnosisChange(index, 'code', e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                  placeholder="e.g., J45"
                />
                {errors[`diagnosis[${index}].code`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`diagnosis[${index}].code`]}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={diag.description}
                  onChange={e => handleDiagnosisChange(index, 'description', e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                  placeholder="e.g., Asthma"
                />
                {errors[`diagnosis[${index}].description`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`diagnosis[${index}].description`]}</p>
                )}
              </div>
              {formData.diagnosis.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDiagnosis(index)}
                  className="mt-2 sm:mt-7 text-red-500 text-sm hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addDiagnosis}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm"
          >
            Add Diagnosis
          </button>
        </div>

        {/* Clinical Notes Section */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Clinical Notes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subjective Notes
              </label>
              <textarea
                value={formData.clinicalNotes.subjective}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    clinicalNotes: { ...prev.clinicalNotes, subjective: e.target.value },
                  }))
                }
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                rows={4}
                placeholder="e.g., Patient reports shortness of breath."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Objective Notes
              </label>
              <textarea
                value={formData.clinicalNotes.objective}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    clinicalNotes: { ...prev.clinicalNotes, objective: e.target.value },
                  }))
                }
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                rows={4}
                placeholder="e.g., BP 120/80, HR 78 bpm."
              />
            </div>
          </div>
        </div>

        {/* Medications Section */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Medications
          </h3>
          {formData.medications.map((med, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Drug
                </label>
                <input
                  type="text"
                  value={med.drug}
                  onChange={e => handleMedicationChange(index, 'drug', e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                  placeholder="e.g., Salbutamol"
                />
                {errors[`medications[${index}].drug`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`medications[${index}].drug`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={med.dosage}
                  onChange={e => handleMedicationChange(index, 'dosage', e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                  placeholder="e.g., 100 mcg"
                />
                {errors[`medications[${index}].dosage`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`medications[${index}].dosage`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequency
                </label>
                <input
                  type="text"
                  value={med.frequency}
                  onChange={e => handleMedicationChange(index, 'frequency', e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                  placeholder="e.g., As needed"
                />
                {errors[`medications[${index}].frequency`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`medications[${index}].frequency`]}</p>
                )}
              </div>
              {formData.medications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="mt-2 sm:mt-7 text-red-500 text-sm hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMedication}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm"
          >
            Add Medication
          </button>
        </div>

        {/* Recommended Tests Section */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Recommended Tests
          </h3>
          {formData.recommendedTests.map((test, index) => (
            <div key={index} className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Test
                </label>
                <input
                  type="text"
                  value={test}
                  onChange={e => handleTestChange(index, e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                  placeholder="e.g., Spirometry"
                />
              </div>
              {formData.recommendedTests.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTest(index)}
                  className="mt-7 text-red-500 text-sm hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTest}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm"
          >
            Add Test
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm sm:text-base"
          >
            Save Consultation
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddConsultation;