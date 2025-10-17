import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addConsultation, searchTestNames, searchDiagnosisCodes, searchDrugs, addMedicalReport } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FiUser, FiCalendar, FiCheck, FiX, FiBook, FiUpload, FiFile } from 'react-icons/fi';
import TabNavigation from '../../components/Doctor/TabNavigation';
import DiagnosisInput from '../../components/Doctor/DiagnosisInput';
import MedicationInput from '../../components/Doctor/MedicationInput';
import TestInput from '../../components/Doctor/TestInput';
import MedicalReportUpload from '../../components/Doctor/MedicalReportUpload';
import FormActions from '../../components/Doctor/FormActions';
import ClinicalNotes from '../../components/Doctor/ClinicalNotes';
import PatientDoctorInfo from '../../components/Doctor/PatientDoctorInfo';
import ConsultationHeader from '../../components/Doctor/ConsultationHeader';
import LoadingIndicator from '../../components/Doctor/LoadingIndicator';

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

interface MedicalReport {
  file: File;
  name: string;
  previewUrl: string;
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
  const { addToast } = useToast();
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
  const [diagnosisSuggestions, setDiagnosisSuggestions] = useState<{ [index: number]: SearchResult[] }>({});
  const [testSuggestions, setTestSuggestions] = useState<{ [index: number]: SearchResult[] }>({});
  const [drugSuggestions, setDrugSuggestions] = useState<{ [index: number]: Drug[] }>({});
  const [isSearchingDiagnosis, setIsSearchingDiagnosis] = useState<{ [index: number]: boolean }>({});
  const [isSearchingTests, setIsSearchingTests] = useState<{ [index: number]: boolean }>({});
  const [isSearchingDrugs, setIsSearchingDrugs] = useState<{ [index: number]: boolean }>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedDrugs, setSelectedDrugs] = useState<{ [index: number]: Drug | null }>({});
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
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
    
    // Show toast notifications for validation errors
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(error => {
        addToast(error, 'error');
      });
      return false;
    }
    
    return true;
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
          addToast('Failed to search diagnosis codes', 'error');
        }
      } catch (err) {
        console.error('Error fetching diagnosis suggestions:', err);
        setDiagnosisSuggestions(prev => ({ ...prev, [index]: [] }));
        addToast('Error fetching diagnosis suggestions', 'error');
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
      handleMedicationChange(index, 'dosage', '');
      handleMedicationChange(index, 'frequency', '');
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
        addToast('Failed to search drugs', 'error');
      }
    } catch (err) {
      console.error('Error fetching drug suggestions:', err);
      setDrugSuggestions(prev => ({ ...prev, [index]: [] }));
      addToast('Error fetching drug suggestions', 'error');
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
          addToast('Failed to search test names', 'error');
        }
      } catch (err) {
        console.error('Error fetching test suggestions:', err);
        setTestSuggestions(prev => ({ ...prev, [index]: [] }));
        addToast('Error fetching test suggestions', 'error');
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

  // Handle medical report file selection
  const handleMedicalReportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newReports: MedicalReport[] = files.map(file => ({
        file,
        name: file.name,
        previewUrl: URL.createObjectURL(file)
      }));
      
      setMedicalReports(prev => [...prev, ...newReports]);
    }
  };

  // Remove a medical report
  const removeMedicalReport = (index: number) => {
    setMedicalReports(prev => {
      const newReports = [...prev];
      // Revoke the object URL to free memory
      URL.revokeObjectURL(newReports[index].previewUrl);
      newReports.splice(index, 1);
      return newReports;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
        const consultationId = response.data._id;
        
        // Upload medical reports if any
        if (medicalReports.length > 0) {
          setIsUploading(true);
          try {
            for (const report of medicalReports) {
              await addMedicalReport(consultationId, report.file);
            }
            addToast('Consultation and medical reports added successfully!', 'success');
          } catch (err) {
            console.error('Error uploading medical reports:', err);
            addToast('Consultation created but some reports failed to upload', 'warning');
          } finally {
            setIsUploading(false);
          }
        } else {
          addToast('Consultation added successfully!', 'success');
        }
        
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
      addToast(errorMessage, 'error');
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
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <ConsultationHeader patientId={formData.patient} />

        <LoadingIndicator isLoading={isLoading} isUploading={isUploading} />

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 overflow-hidden">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Patient and Doctor Section */}
          {activeTab === 'basic' && (
            <>
              <PatientDoctorInfo
                patientName={patientName}
                doctorName={doctorName}
                consultationDate={formData.consultationDate}
                status={formData.status}
                setStatus={(status) => setFormData(prev => ({ ...prev, status: status as ConsultationForm['status'] }))}
                setDateToNow={setDateToNow}
                errors={errors}
              />
              <div className="p-6 pt-0">
                <DiagnosisInput 
                  diagnosis={formData.diagnosis}
                  setDiagnosis={(diagnosis) => setFormData(prev => ({ ...prev, diagnosis }))}
                  errors={errors}
                  setErrors={setErrors}
                />
              </div>
            </>
          )}

          {/* Clinical Notes Section */}
          {activeTab === 'clinical' && (
            <ClinicalNotes
              subjective={formData.clinicalNotes.subjective}
              setSubjective={(value) => setFormData(prev => ({
                ...prev,
                clinicalNotes: { ...prev.clinicalNotes, subjective: value },
              }))}
              objective={formData.clinicalNotes.objective}
              setObjective={(value) => setFormData(prev => ({
                ...prev,
                clinicalNotes: { ...prev.clinicalNotes, objective: value },
              }))}
            />
          )}

          {/* Medications Section */}
          {activeTab === 'meds' && (
            <MedicationInput
              medications={formData.medications}
              setMedications={(medications) => setFormData(prev => ({ ...prev, medications }))}
              errors={errors}
              setErrors={setErrors}
            />
          )}

          {/* Recommended Tests Section */}
          {activeTab === 'tests' && (
            <TestInput
              tests={formData.recommendedTests}
              setTests={(tests) => setFormData(prev => ({ ...prev, recommendedTests: tests }))}
              errors={errors}
              setErrors={setErrors}
            />
          )}

          {/* Medical Reports Section */}
          {activeTab === 'reports' && (
            <MedicalReportUpload
              medicalReports={medicalReports}
              setMedicalReports={setMedicalReports}
              handleMedicalReportChange={handleMedicalReportChange}
              removeMedicalReport={removeMedicalReport}
            />
          )}

          <FormActions
            isLoading={isLoading}
            isUploading={isUploading}
            patientId={formData.patient}
            handleSubmit={handleSubmit}
          />
        </form>
      </div>
    </div>
  );
};

export default AddConsultation;