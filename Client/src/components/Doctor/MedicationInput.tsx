import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

interface Medication {
  drug: string;
  dosage: string;
  frequency: string;
}

interface Drug {
  id: string;
  name: string;
  dosageForms: string[];
  frequencyOptions: string[];
}

interface MedicationInputProps {
  medications: Medication[];
  setMedications: (medications: Medication[]) => void;
  errors: { [key: string]: string };
  setErrors: (errors: { [key: string]: string }) => void;
}

const MedicationInput: React.FC<MedicationInputProps> = ({
  medications,
  setMedications,
  errors,
  setErrors
}) => {
  const [drugSuggestions, setDrugSuggestions] = useState<{ [index: number]: Drug[] }>({});
  const [isSearchingDrugs, setIsSearchingDrugs] = useState<{ [index: number]: boolean }>({});
  const [selectedDrugs, setSelectedDrugs] = useState<{ [index: number]: Drug | null }>({});
  const drugDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(drugSuggestions).forEach(index => {
        const currentIndex = parseInt(index);
        if (drugDropdownRefs.current[currentIndex] && 
            !drugDropdownRefs.current[currentIndex]?.contains(event.target as Node)) {
          setDrugSuggestions(prev => ({ ...prev, [currentIndex]: [] }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [drugSuggestions]);

  // Handle medication input
  const handleMedicationChange = (index: number, field: string, value: string) => {
    const newMedications = [...medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setMedications(newMedications);
    setErrors({ ...errors, [`medications[${index}].${field}`]: '' });
  };

  // Handle drug input with autocomplete
  const handleDrugChange = async (index: number, value: string) => {
    const newMedications = [...medications];
    newMedications[index] = { ...newMedications[index], drug: value };
    setMedications(newMedications);
    setErrors({ ...errors, [`medications[${index}].drug`]: '' });

    // Clear selected drug when user types a different value
    if (selectedDrugs[index] && selectedDrugs[index]?.name !== value) {
      const newSelectedDrugs = { ...selectedDrugs };
      newSelectedDrugs[index] = null;
      setSelectedDrugs(newSelectedDrugs);
      
      // Reset dosage and frequency when drug name changes
      handleMedicationChange(index, 'dosage', '');
      handleMedicationChange(index, 'frequency', '');
    }

    // For demo purposes, we'll just clear suggestions
    setDrugSuggestions(prev => ({ ...prev, [index]: [] }));
    setIsSearchingDrugs(prev => ({ ...prev, [index]: false }));
  };

  // Select drug from suggestions
  const selectDrug = (index: number, drug: Drug) => {
    const newMedications = [...medications];
    newMedications[index] = {
      ...newMedications[index],
      drug: drug.name,
      dosage: drug.dosageForms[0] || '',
      frequency: drug.frequencyOptions[0] || '',
    };
    setMedications(newMedications);
    setDrugSuggestions(prev => ({ ...prev, [index]: [] }));
    
    const newSelectedDrugs = { ...selectedDrugs };
    newSelectedDrugs[index] = drug;
    setSelectedDrugs(newSelectedDrugs);
    
    setErrors({
      ...errors,
      [`medications[${index}].drug`]: '',
      [`medications[${index}].dosage`]: '',
      [`medications[${index}].frequency`]: '',
    });
  };

  // Handle dosage change
  const handleDosageChange = (index: number, value: string) => {
    const newMedications = [...medications];
    newMedications[index] = { ...newMedications[index], dosage: value };
    setMedications(newMedications);
    setErrors({ ...errors, [`medications[${index}].dosage`]: '' });
  };

  // Handle frequency change
  const handleFrequencyChange = (index: number, value: string) => {
    const newMedications = [...medications];
    newMedications[index] = { ...newMedications[index], frequency: value };
    setMedications(newMedications);
    setErrors({ ...errors, [`medications[${index}].frequency`]: '' });
  };

  // Add/remove medication fields
  const addMedication = () => {
    setMedications([...medications, { drug: '', dosage: '', frequency: '' }]);
    const newSelectedDrugs = { ...selectedDrugs };
    newSelectedDrugs[medications.length] = null;
    setSelectedDrugs(newSelectedDrugs);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    delete newErrors[`medications[${index}].drug`];
    delete newErrors[`medications[${index}].dosage`];
    delete newErrors[`medications[${index}].frequency`];
    setErrors(newErrors);
    
    const newSelectedDrugs = { ...selectedDrugs };
    delete newSelectedDrugs[index];
    setSelectedDrugs(newSelectedDrugs);
  };

  return (
    <div className="">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 flex items-center">
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Medications
        </h3>
        <button
          type="button"
          onClick={addMedication}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm flex items-center"
        >
          <FiPlus className="mr-1" />
          Add Medication
        </button>
      </div>
      <div className="p-6">
        {medications.map((med, index) => (
          <div key={index} className="rounded-l p-2 mb-6">
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
                    className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 ${
                      selectedDrugs[index] 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700 focus:ring-green-500' 
                        : 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500'
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
                        const newSelectedDrugs = { ...selectedDrugs };
                        newSelectedDrugs[index] = null;
                        setSelectedDrugs(newSelectedDrugs);
                        handleMedicationChange(index, 'drug', '');
                        handleDosageChange(index, '');
                        handleFrequencyChange(index, '');
                      }}
                      className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
                      title="Clear selection"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {drugSuggestions[index]?.length > 0 && (
                  <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl mt-2 max-h-60 overflow-auto shadow-lg" 
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
                        className="p-4 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100 first:rounded-t-xl last:rounded-b-xl"
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
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Twice daily"
                  />
                )}
                {errors[`medications[${index}].frequency`] && (
                  <p className="text-red-500 text-xs mt-2">{errors[`medications[${index}].frequency`]}</p>
                )}
              </div>
            </div>
            {medications.length > 1 && (
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="text-red-500 hover:text-red-700 flex items-center text-sm bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 px-4 py-2 rounded-lg"
                >
                  <FiTrash2 className="h-4 w-4 mr-1" />
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationInput;