import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addConsultation, searchTestNames, searchDiagnosisCodes, searchDrugs } from '../../utils/api';
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

interface Drug {
  id: string;
  name: string;
  dosageForms: string[];
  frequencyOptions: string[];
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
  const [drugSuggestions, setDrugSuggestions] = useState<{ [index: number]: Drug[] }>({});
  const [isSearchingDiagnosis, setIsSearchingDiagnosis] = useState<{ [index: number]: boolean }>({});
  const [isSearchingTests, setIsSearchingTests] = useState<{ [index: number]: boolean }>({});
  const [isSearchingDrugs, setIsSearchingDrugs] = useState<{ [index: number]: boolean }>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedDrugs, setSelectedDrugs] = useState<{ [index: number]: Drug | null }>({});
  
  // Refs for detecting clicks outside dropdowns
  const drugDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const diagnosisDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const testDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close drug dropdowns
      Object.keys(drugSuggestions).forEach(index => {
        const currentIndex = parseInt(index);
        if (drugDropdownRefs.current[currentIndex] && 
            !drugDropdownRefs.current[currentIndex]?.contains(event.target as Node)) {
          setDrugSuggestions(prev => ({ ...prev, [currentIndex]: [] }));
        }
      });
      
      // Close diagnosis dropdowns
      Object.keys(diagnosisSuggestions).forEach(index => {
        const currentIndex = parseInt(index);
        if (diagnosisDropdownRefs.current[currentIndex] && 
            !diagnosisDropdownRefs.current[currentIndex]?.contains(event.target as Node)) {
          setDiagnosisSuggestions(prev => ({ ...prev, [currentIndex]: [] }));
        }
      });
      
      // Close test dropdowns
      Object.keys(testSuggestions).forEach(index => {
        const currentIndex = parseInt(index);
        if (testDropdownRefs.current[currentIndex] && 
            !testDropdownRefs.current[currentIndex]?.contains(event.target as Node)) {
          setTestSuggestions(prev => ({ ...prev, [currentIndex]: [] }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [drugSuggestions, diagnosisSuggestions, testSuggestions]);

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
    const drugNames = new Set<string>();
    for (let i = 0; i < formData.medications.length; i++) {
      const med = formData.medications[i];
      if (!med.drug) {
        newErrors[`medications[${i}].drug`] = 'Drug name is required';
      } else if (drugNames.has(med.drug.toLowerCase())) {
        newErrors[`medications[${i}].drug`] = 'Duplicate drug entry';
      } else {
        drugNames.add(med.drug.toLowerCase());
      }
      
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

  // Handle drug input with autocomplete
  const handleDrugChange = async (index: number, value: string) => {
    const newMedications = [...formData.medications];
    newMedications[index] = { ...newMedications[index], drug: value };
    setFormData(prev => ({ ...prev, medications: newMedications }));
    setErrors(prev => ({ ...prev, [`medications[${index}].drug`]: '' }));

    // Clear selected drug when user types a different value
    // Only clear if the value is different from the selected drug name
    if (selectedDrugs[index] && selectedDrugs[index]?.name !== value) {
      setSelectedDrugs(prev => ({ ...prev, [index]: null }));
      // Reset dosage and frequency when drug name changes
      handleDosageChange(index, '');
      handleFrequencyChange(index, '');
    }

    // Always trigger search for drug suggestions, even for single characters
    // This improves responsiveness for the user
    setIsSearchingDrugs(prev => ({ ...prev, [index]: true }));
    try {
      const response = await searchDrugs({ query: value, maxResults: 10 });
      if (response.success) {
        setDrugSuggestions(prev => ({ ...prev, [index]: response.data.results }));
      } else {
        setDrugSuggestions(prev => ({ ...prev, [index]: [] }));
      }
    } catch (err) {
      console.error('Error fetching drug suggestions:', err);
      setDrugSuggestions(prev => ({ ...prev, [index]: [] }));
    } finally {
      setIsSearchingDrugs(prev => ({ ...prev, [index]: false }));
    }
  };

  // Select drug from suggestions
  const selectDrug = (index: number, drug: Drug) => {
    const newMedications = [...formData.medications];
    newMedications[index] = {
      ...newMedications[index],
      drug: drug.name,
      dosage: drug.dosageForms[0] || '',
      frequency: drug.frequencyOptions[0] || '',
    };
    setFormData(prev => ({ ...prev, medications: newMedications }));
    setDrugSuggestions(prev => ({ ...prev, [index]: [] }));
    setSelectedDrugs(prev => ({ ...prev, [index]: drug }));
    setErrors(prev => ({
      ...prev,
      [`medications[${index}].drug`]: '',
      [`medications[${index}].dosage`]: '',
      [`medications[${index}].frequency`]: '',
    }));
  };

  // Handle dosage change
  const handleDosageChange = (index: number, value: string) => {
    const newMedications = [...formData.medications];
    newMedications[index] = { ...newMedications[index], dosage: value };
    setFormData(prev => ({ ...prev, medications: newMedications }));
    setErrors(prev => ({ ...prev, [`medications[${index}].dosage`]: '' }));
  };

  // Handle frequency change
  const handleFrequencyChange = (index: number, value: string) => {
    const newMedications = [...formData.medications];
    newMedications[index] = { ...newMedications[index], frequency: value };
    setFormData(prev => ({ ...prev, medications: newMedications }));
    setErrors(prev => ({ ...prev, [`medications[${index}].frequency`]: '' }));
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
    // Set the new medication entry's selected drug to null
    setSelectedDrugs(prev => ({
      ...prev,
      [formData.medications.length]: null,
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
    setSelectedDrugs(prev => {
      const newSelected = { ...prev };
      delete newSelected[index];
      return newSelected;
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
      <h2 className="text-3xl font-bold mb-6 text-blue-600 dark:text-blue-300">
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 p-1">
          <button
            type="button"
            className={`py-3 px-6 font-medium text-sm rounded-full transition-all duration-200 ${
              activeTab === 'basic' 
                ? 'text-blue-600 bg-white dark:bg-gray-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            type="button"
            className={`py-3 px-6 font-medium text-sm rounded-full transition-all duration-200 ${
              activeTab === 'clinical' 
                ? 'text-blue-600 bg-white dark:bg-gray-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('clinical')}
          >
            Clinical Info
          </button>
          <button
            type="button"
            className={`py-3 px-6 font-medium text-sm rounded-full transition-all duration-200 ${
              activeTab === 'meds' 
                ? 'text-blue-600 bg-white dark:bg-gray-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('meds')}
          >
            Medications
          </button>
          <button
            type="button"
            className={`py-3 px-6 font-medium text-sm rounded-full transition-all duration-200 ${
              activeTab === 'tests' 
                ? 'text-blue-600 bg-white dark:bg-gray-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('tests')}
          >
            Tests
          </button>
        </div>

        {/* Patient and Doctor Section */}
        {activeTab === 'basic' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                Patient and Doctor Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Patient
                  </label>
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl">
                    {patientName}
                  </div>
                  {errors.patient && (
                    <p className="text-red-500 text-xs mt-2">{errors.patient}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Doctor
                  </label>
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl">
                    {doctorName}
                  </div>
                  {errors.doctor && (
                    <p className="text-red-500 text-xs mt-2">{errors.doctor}</p>
                  )}
                </div>
              </div>
              
              {/* Consultation Details */}
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Consultation Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Consultation Date
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl">
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
                      </div>
                      <button
                        type="button"
                        onClick={setDateToNow}
                        className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm transition-all duration-200 ease-in-out transform hover:scale-105"
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
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
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
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                    Diagnosis
                  </h4>
                  <button
                    type="button"
                    onClick={addDiagnosis}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm flex items-center transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add
                  </button>
                </div>
                {formData.diagnosis.map((diag, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 relative border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div ref={el => diagnosisDropdownRefs.current[index] = el}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ICD-10 Code
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={diag.code}
                          onChange={e => handleDiagnosisChange(index, 'code', e.target.value)}
                          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                          placeholder="e.g., A00 or A00.0"
                        />
                        {isSearchingDiagnosis[index] && (
                          <svg className="absolute right-4 top-4 h-6 w-6 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      </div>
                      {diagnosisSuggestions[index]?.length > 0 && (
                        <ul className="absolute z-20 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl mt-2 max-h-60 overflow-auto shadow-lg"
                            style={{ 
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              zIndex: 1000,
                              maxHeight: '200px',
                              overflowY: 'auto'
                            }}>
                          {diagnosisSuggestions[index].map((suggestion, i) => (
                            <li
                              key={i}
                              onClick={() => selectDiagnosis(index, suggestion)}
                              className="p-4 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100 first:rounded-t-2xl last:rounded-b-2xl transition-colors duration-150"
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
                    <div className="sm:col-span-2" ref={el => diagnosisDropdownRefs.current[index] = el}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={diag.description}
                          onChange={e => handleDiagnosisChange(index, 'description', e.target.value)}
                          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                          placeholder="e.g., Cholera"
                        />
                        {isSearchingDiagnosis[index] && (
                          <svg className="absolute right-4 top-4 h-6 w-6 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      </div>
                      {diagnosisSuggestions[index]?.length > 0 && (
                        <ul className="absolute z-20 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl mt-2 max-h-60 overflow-auto shadow-lg"
                            style={{ 
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              zIndex: 1000,
                              maxHeight: '200px',
                              overflowY: 'auto'
                            }}>
                          {diagnosisSuggestions[index].map((suggestion, i) => (
                            <li
                              key={i}
                              onClick={() => selectDiagnosis(index, suggestion)}
                              className="p-4 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100 first:rounded-t-2xl last:rounded-b-2xl transition-colors duration-150"
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
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => removeDiagnosis(index)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clinical Notes Section */}
        {activeTab === 'clinical' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                Clinical Notes
              </h3>
            </div>
            <div className="p-6">
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
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                    rows={6}
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
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                    rows={6}
                    placeholder="Clinical observations (e.g., BP 120/80, HR 78 bpm)"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medications Section */}
        {activeTab === 'meds' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                Medications
              </h3>
              <button
                type="button"
                onClick={addMedication}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm flex items-center transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Medication
              </button>
            </div>
            <div className="p-6">
              {formData.medications.map((med, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6 bg-gray-50 dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative" ref={el => drugDropdownRefs.current[index] = el}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Drug Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={med.drug}
                          onChange={e => handleDrugChange(index, e.target.value)}
                          className={`w-full p-4 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 ${
                            selectedDrugs[index] 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700' 
                              : 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600'
                          } ${
                            selectedDrugs[index] 
                              ? 'focus:border-green-500 dark:focus:border-green-500' 
                              : 'focus:border-blue-500 dark:focus:border-blue-500'
                          }`}
                          placeholder="Start typing to search drug..."
                        />
                        {isSearchingDrugs[index] && (
                          <svg className="absolute right-4 top-4 h-6 w-6 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {selectedDrugs[index] && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDrugs(prev => ({ ...prev, [index]: null }));
                              handleMedicationChange(index, 'drug', '');
                              handleDosageChange(index, '');
                              handleFrequencyChange(index, '');
                            }}
                            className="absolute right-4 top-4 text-gray-500 hover:text-red-500 transition-colors duration-200"
                            title="Clear selection"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {drugSuggestions[index]?.length > 0 && (
                        <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl mt-2 max-h-60 overflow-auto shadow-lg" 
                            style={{ 
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              zIndex: 1000,
                              maxHeight: '200px',
                              overflowY: 'auto'
                            }}>
                          {drugSuggestions[index].map((drug, i) => (
                            <li
                              key={i}
                              onClick={() => selectDrug(index, drug)}
                              className="p-4 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100 first:rounded-t-2xl last:rounded-b-2xl transition-colors duration-150"
                            >
                              <div className="font-medium">{drug.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Dosage: {drug.dosageForms.join(', ')} | Frequency: {drug.frequencyOptions.join(', ')}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      {errors[`medications[${index}].drug`] && (
                        <p className="text-red-500 text-xs mt-2">{errors[`medications[${index}].drug`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dosage
                      </label>
                      {selectedDrugs[index] ? (
                        <select
                          value={med.dosage}
                          onChange={e => handleDosageChange(index, e.target.value)}
                          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="">Select dosage</option>
                          {selectedDrugs[index]?.dosageForms.map((dosage, i) => (
                            <option key={i} value={dosage}>
                              {dosage}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={e => handleDosageChange(index, e.target.value)}
                          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                          placeholder="e.g., 500 mg"
                        />
                      )}
                      {errors[`medications[${index}].dosage`] && (
                        <p className="text-red-500 text-xs mt-2">{errors[`medications[${index}].dosage`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frequency
                      </label>
                      {selectedDrugs[index] ? (
                        <select
                          value={med.frequency}
                          onChange={e => handleFrequencyChange(index, e.target.value)}
                          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="">Select frequency</option>
                          {selectedDrugs[index]?.frequencyOptions.map((freq, i) => (
                            <option key={i} value={freq}>
                              {freq}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={e => handleFrequencyChange(index, e.target.value)}
                          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                          placeholder="e.g., Twice daily"
                        />
                      )}
                      {errors[`medications[${index}].frequency`] && (
                        <p className="text-red-500 text-xs mt-2">{errors[`medications[${index}].frequency`]}</p>
                      )}
                    </div>
                  </div>
                  {formData.medications.length > 1 && (
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-500 hover:text-red-700 flex items-center text-sm bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 px-4 py-2 rounded-full transition-all duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Tests Section */}
        {activeTab === 'tests' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                Recommended Tests
              </h3>
              <button
                type="button"
                onClick={addTest}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm flex items-center transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Test
              </button>
            </div>
            <div className="p-6">
              {formData.recommendedTests.map((test, index) => (
                <div key={index} className="mb-4 relative">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1" ref={el => testDropdownRefs.current[index] = el}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Test Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={test}
                          onChange={e => handleTestChange(index, e.target.value)}
                          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                          placeholder="e.g., Blood culture"
                        />
                        {isSearchingTests[index] && (
                          <svg className="absolute right-4 top-4 h-6 w-6 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      </div>
                      {testSuggestions[index]?.length > 0 && (
                        <ul className="absolute z-20 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl mt-2 max-h-60 overflow-auto shadow-lg"
                            style={{ 
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              zIndex: 1000,
                              maxHeight: '200px',
                              overflowY: 'auto'
                            }}>
                          {testSuggestions[index].map((suggestion, i) => (
                            <li
                              key={i}
                              onClick={() => selectTest(index, suggestion)}
                              className="p-4 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100 first:rounded-t-2xl last:rounded-b-2xl transition-colors duration-150"
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
                      <div className="flex items-center pt-6">
                        <button
                          type="button"
                          onClick={() => removeTest(index)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 flex items-center text-lg font-medium transition-all duration-200 ease-in-out transform hover:scale-105 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Save Consultation
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddConsultation;