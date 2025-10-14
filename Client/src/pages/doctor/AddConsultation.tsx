
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addConsultation, searchTestNames, searchDiagnosisCodes } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// Define interfaces
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
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface SearchResult {
  code?: string;
  name?: string;
  description?: string;
}

const AddConsultation: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<ConsultationForm>({
    patient: patientId || '',
    doctor: user?.id || '',
    consultationDate: '',
    diagnosis: [{ code: '', description: '' }],
    clinicalNotes: { subjective: '', objective: '' },
    medications: [{ drug: '', dosage: '', frequency: '' }],
    recommendedTests: [''],
    status: 'SCHEDULED',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [diagnosisSuggestions, setDiagnosisSuggestions] = useState<{ [index: number]: SearchResult[] }>({});
  const [testSuggestions, setTestSuggestions] = useState<{ [index: number]: SearchResult[] }>({});
  const [isSearchingDiagnosis, setIsSearchingDiagnosis] = useState<{ [index: number]: boolean }>({});
  const [isSearchingTests, setIsSearchingTests] = useState<{ [index: number]: boolean }>({});

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'DOCTOR')) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Update doctor ID when user changes
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({ ...prev, doctor: user.id }));
    }
  }, [user]);

  // Validate form data
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.patient) {
      newErrors.patient = 'Patient ID is required';
    }
    if (!formData.doctor) {
      newErrors.doctor = 'Doctor ID is required';
    }
    if (!formData.consultationDate) {
      newErrors.consultationDate = 'Consultation date is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    // Validate diagnosis - now we just check if code and description are provided
    for (let i = 0; i < formData.diagnosis.length; i++) {
      const diag = formData.diagnosis[i];
      if (!diag.code) {
        newErrors[`diagnosis[${i}].code`] = 'Diagnosis code is required';
      }
      if (!diag.description) {
        newErrors[`diagnosis[${i}].description`] = 'Diagnosis description is required';
      }
    }

    // Validate medications
    for (let i = 0; i < formData.medications.length; i++) {
      const med = formData.medications[i];
      if (!med.drug) newErrors[`medications[${i}].drug`] = 'Drug name is required';
      if (!med.dosage) newErrors[`medications[${i}].dosage`] = 'Dosage is required';
      if (!med.frequency) newErrors[`medications[${i}].frequency`] = 'Frequency is required';
    }

    // Validate recommended tests
    for (let i = 0; i < formData.recommendedTests.length; i++) {
      if (formData.recommendedTests[i].trim() === '') {
        newErrors[`recommendedTests[${i}]`] = 'Test name cannot be empty';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle diagnosis input with autocomplete
  const handleDiagnosisChange = async (index: number, field: string, value: string) => {
    const newDiagnosis = [...formData.diagnosis];
    newDiagnosis[index] = { ...newDiagnosis[index], [field]: value };
    setFormData(prev => ({ ...prev, diagnosis: newDiagnosis }));
    setErrors(prev => ({ ...prev, [`diagnosis[${index}].${field}`]: '' }));

    // Trigger search for code or description with 2+ characters
    if ((field === 'code' || field === 'description') && value.length >= 2) {
      setIsSearchingDiagnosis(prev => ({ ...prev, [index]: true }));
      try {
        const response = await searchDiagnosisCodes({ query: value, maxResults: 10 });
        if (response.success) {
          setDiagnosisSuggestions(prev => ({ ...prev, [index]: response.data.results }));
        } else {
          setDiagnosisSuggestions(prev => ({ ...prev, [index]: [] }));
        }
      } catch (err) {
        console.error('Error fetching diagnosis suggestions:', err);
        setDiagnosisSuggestions(prev => ({ ...prev, [index]: [] }));
      } finally {
        setIsSearchingDiagnosis(prev => ({ ...prev, [index]: false }));
      }
    } else {
      setDiagnosisSuggestions(prev => ({ ...prev, [index]: [] }));
      setIsSearchingDiagnosis(prev => ({ ...prev, [index]: false }));
    }
  };

  // Select diagnosis from suggestions
  const selectDiagnosis = (index: number, suggestion: SearchResult) => {
    const newDiagnosis = [...formData.diagnosis];
    newDiagnosis[index] = {
      code: suggestion.code || '',
      description: suggestion.description || suggestion.name || '',
    };
    setFormData(prev => ({ ...prev, diagnosis: newDiagnosis }));
    setDiagnosisSuggestions(prev => ({ ...prev, [index]: [] }));
    setErrors(prev => ({
      ...prev,
      [`diagnosis[${index}].code`]: '',
      [`diagnosis[${index}].description`]: '',
    }));
  };

  // Handle medication input
  const handleMedicationChange = (index: number, field: string, value: string) => {
    const newMedications = [...formData.medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setFormData(prev => ({ ...prev, medications: newMedications }));
    setErrors(prev => ({ ...prev, [`medications[${index}].${field}`]: '' }));
  };

  // Handle test input with autocomplete
  const handleTestChange = async (index: number, value: string) => {
    const newTests = [...formData.recommendedTests];
    newTests[index] = value;
    setFormData(prev => ({ ...prev, recommendedTests: newTests }));
    setErrors(prev => ({ ...prev, [`recommendedTests[${index}]`]: '' }));

    if (value.length >= 2) {
      setIsSearchingTests(prev => ({ ...prev, [index]: true }));
      try {
        const response = await searchTestNames({ query: value, maxResults: 10 });
        if (response.success) {
          setTestSuggestions(prev => ({ ...prev, [index]: response.data.results }));
        } else {
          setTestSuggestions(prev => ({ ...prev, [index]: [] }));
        }
      } catch (err) {
        console.error('Error fetching test suggestions:', err);
        setTestSuggestions(prev => ({ ...prev, [index]: [] }));
      } finally {
        setIsSearchingTests(prev => ({ ...prev, [index]: false }));
      }
    } else {
      setTestSuggestions(prev => ({ ...prev, [index]: [] }));
      setIsSearchingTests(prev => ({ ...prev, [index]: false }));
    }
  };

  // Select test from suggestions
  const selectTest = (index: number, suggestion: SearchResult) => {
    const newTests = [...formData.recommendedTests];
    newTests[index] = suggestion.name || '';
    setFormData(prev => ({ ...prev, recommendedTests: newTests }));
    setTestSuggestions(prev => ({ ...prev, [index]: [] }));
    setErrors(prev => ({ ...prev, [`recommendedTests[${index}]`]: '' }));
  };

  // Add/remove dynamic fields
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
    setDiagnosisSuggestions(prev => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      return newSuggestions;
    });
    setIsSearchingDiagnosis(prev => {
      const newSearching = { ...prev };
      delete newSearching[index];
      return newSearching;
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
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`recommendedTests[${index}]`];
      return newErrors;
    });
    setTestSuggestions(prev => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      return newSuggestions;
    });
    setIsSearchingTests(prev => {
      const newSearching = { ...prev };
      delete newSearching[index];
      return newSearching;
    });
  };

  // Set consultation date to now
  const setDateToNow = () => {
    const now = new Date().toISOString().split('.')[0];
    setFormData(prev => ({ ...prev, consultationDate: now }));
    setErrors(prev => ({ ...prev, consultationDate: '' }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrors(prev => ({ ...prev, general: '' }));
    try {
      const isValid = validateForm();
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      // Prepare submission data (remove empty tests)
      const submissionData: ConsultationForm = {
        ...formData,
        recommendedTests: formData.recommendedTests.filter(test => test.trim() !== ''),
      };

      console.log('Submitting consultation:', JSON.stringify(submissionData, null, 2));
      const response = await addConsultation(submissionData);
      console.log('addConsultation response:', response);
      if (response.success) {
        setSuccessMessage('Consultation added successfully!');
        setTimeout(() => {
          navigate(`/doctor-dashboard/consultation/patient/${formData.patient}`);
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to add consultation');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      // Extract validation errors from the error message if they exist
      const errorMessage = err.message || 'Failed to add consultation';
      if (errorMessage.includes('Validation errors:')) {
        // Display detailed validation errors
        setErrors(prev => ({ ...prev, general: errorMessage }));
      } else {
        setErrors(prev => ({ ...prev, general: errorMessage }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format names for display
  const doctorName = user ? `${user.firstName} ${user.lastName}` : 'Unknown Doctor';
  const patientName = formData.patient ? `Patient ID: ${formData.patient}` : 'Unknown Patient';

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="p-6 min-h-screen text-center text-blue-600 dark:text-blue-300">
        <svg className="animate-spin h-8 w-8 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-300">
        Add New Consultation
      </h2>
      {isLoading && (
        <div className="mb-6 p-4 text-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving consultation...
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg">
          {successMessage}
        </div>
      )}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg">
          {errors.general}
        </div>
      )}
      {/* Display detailed validation errors if they exist */}
      {errors.general && errors.general.includes('Validation errors:') && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg">
          <h3 className="font-bold mb-2">Validation Details:</h3>
          <ul className="list-disc pl-5">
            {errors.general.split('Validation errors: ')[1].split(', ').map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient and Doctor Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Patient and Doctor
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Patient
              </label>
              <p className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg">
                {patientName}
              </p>
              {errors.patient && (
                <p className="text-red-500 text-xs mt-2">{errors.patient}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Doctor
              </label>
              <p className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg">
                {doctorName}
              </p>
              {errors.doctor && (
                <p className="text-red-500 text-xs mt-2">{errors.doctor}</p>
              )}
            </div>
          </div>
        </div>

        {/* Consultation Details Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Consultation Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Consultation Date
              </label>
              <div className="flex items-center space-x-4">
                <p className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg flex-1">
                  {formData.consultationDate
                    ? new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Kolkata',
                      }).format(new Date(formData.consultationDate))
                    : 'Not set'}
                </p>
                <button
                  type="button"
                  onClick={setDateToNow}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
                >
                  Set to Now
                </button>
              </div>
              {errors.consultationDate && (
                <p className="text-red-500 text-xs mt-2">{errors.consultationDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as ConsultationForm['status'] }))}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-2">{errors.status}</p>
              )}
            </div>
          </div>
        </div>

        {/* Diagnosis Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Diagnosis
          </h3>
          {formData.diagnosis.map((diag, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 relative">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ICD-10 Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={diag.code}
                    onChange={e => handleDiagnosisChange(index, 'code', e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., A00 or A00.0"
                  />
                  {isSearchingDiagnosis[index] && (
                    <svg className="absolute right-3 top-3 h-5 w-5 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </div>
                {diagnosisSuggestions[index]?.length > 0 && (
                  <ul className="absolute z-10 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg mt-2 max-h-48 overflow-auto shadow-lg">
                    {diagnosisSuggestions[index].map((suggestion, i) => (
                      <li
                        key={i}
                        onClick={() => selectDiagnosis(index, suggestion)}
                        className="p-3 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                      >
                        {suggestion.code} - {suggestion.description || suggestion.name}
                      </li>
                    ))}
                  </ul>
                )}
                {errors[`diagnosis[${index}].code`] && (
                  <p className="text-red-500 text-xs mt-2">{errors[`diagnosis[${index}].code`]}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={diag.description}
                    onChange={e => handleDiagnosisChange(index, 'description', e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., Cholera"
                  />
                  {isSearchingDiagnosis[index] && (
                    <svg className="absolute right-3 top-3 h-5 w-5 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </div>
                {diagnosisSuggestions[index]?.length > 0 && (
                  <ul className="absolute z-10 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg mt-2 max-h-48 overflow-auto shadow-lg">
                    {diagnosisSuggestions[index].map((suggestion, i) => (
                      <li
                        key={i}
                        onClick={() => selectDiagnosis(index, suggestion)}
                        className="p-3 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                      >
                        {suggestion.code} - {suggestion.description || suggestion.name}
                      </li>
                    ))}
                  </ul>
                )}
                {errors[`diagnosis[${index}].description`] && (
                  <p className="text-red-500 text-xs mt-2">{errors[`diagnosis[${index}].description`]}</p>
                )}
              </div>
              {formData.diagnosis.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDiagnosis(index)}
                  className="mt-2 sm:mt-8 text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addDiagnosis}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
          >
            Add Diagnosis
          </button>
        </div>

        {/* Clinical Notes Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Clinical Notes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
                placeholder="Patient reports symptoms (e.g., fever, diarrhea)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
                placeholder="Clinical observations (e.g., BP 120/80, HR 78 bpm)"
              />
            </div>
          </div>
        </div>

        {/* Medications Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Medications
          </h3>
          {formData.medications.map((med, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Drug
                </label>
                <input
                  type="text"
                  value={med.drug}
                  onChange={e => handleMedicationChange(index, 'drug', e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Doxycycline"
                />
                {errors[`medications[${index}].drug`] && (
                  <p className="text-red-500 text-xs mt-2">{errors[`medications[${index}].drug`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dosage
                </label>
                <input
                  type="text"
                  value={med.dosage}
                  onChange={e => handleMedicationChange(index, 'dosage', e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., 100 mg"
                />
                {errors[`medications[${index}].dosage`] && (
                  <p className="text-red-500 text-xs mt-2">{errors[`medications[${index}].dosage`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency
                </label>
                <input
                  type="text"
                  value={med.frequency}
                  onChange={e => handleMedicationChange(index, 'frequency', e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Twice daily"
                />
                {errors[`medications[${index}].frequency`] && (
                  <p className="text-red-500 text-xs mt-2">{errors[`medications[${index}].frequency`]}</p>
                )}
              </div>
              {formData.medications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="mt-2 sm:mt-8 text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMedication}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
          >
            Add Medication
          </button>
        </div>

        {/* Recommended Tests Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-4">
            Recommended Tests
          </h3>
          {formData.recommendedTests.map((test, index) => (
            <div key={index} className="flex items-center space-x-4 mb-6 relative">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={test}
                    onChange={e => handleTestChange(index, e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., Blood culture"
                  />
                  {isSearchingTests[index] && (
                    <svg className="absolute right-3 top-3 h-5 w-5 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </div>
                {testSuggestions[index]?.length > 0 && (
                  <ul className="absolute z-10 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg mt-2 max-h-48 overflow-auto shadow-lg">
                    {testSuggestions[index].map((suggestion, i) => (
                      <li
                        key={i}
                        onClick={() => selectTest(index, suggestion)}
                        className="p-3 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                      >
                        {suggestion.name}
                      </li>
                    ))}
                  </ul>
                )}
                {errors[`recommendedTests[${index}]`] && (
                  <p className="text-red-500 text-xs mt-2">{errors[`recommendedTests[${index}]`]}</p>
                )}
              </div>
              {formData.recommendedTests.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTest(index)}
                  className="mt-8 text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTest}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
          >
            Add Test
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Save Consultation
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddConsultation;
