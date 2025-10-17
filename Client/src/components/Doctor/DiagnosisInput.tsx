import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';
import { searchDiagnosisCodes } from '../../utils/api';

interface Diagnosis {
  code: string;
  description: string;
}

interface SearchResult {
  code?: string;
  name?: string;
  description?: string;
}

interface DiagnosisInputProps {
  diagnosis: Diagnosis[];
  setDiagnosis: (diagnosis: Diagnosis[]) => void;
  errors: { [key: string]: string };
  setErrors: (errors: { [key: string]: string }) => void;
}

const DiagnosisInput: React.FC<DiagnosisInputProps> = ({
  diagnosis,
  setDiagnosis,
  errors,
  setErrors
}) => {
  const [diagnosisSuggestions, setDiagnosisSuggestions] = useState<{ [index: number]: SearchResult[] }>({});
  const [isSearchingDiagnosis, setIsSearchingDiagnosis] = useState<{ [index: number]: boolean }>({});
  const diagnosisDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(diagnosisSuggestions).forEach(index => {
        const currentIndex = parseInt(index);
        if (diagnosisDropdownRefs.current[currentIndex] && 
            !diagnosisDropdownRefs.current[currentIndex]?.contains(event.target as Node)) {
          setDiagnosisSuggestions(prev => ({ ...prev, [currentIndex]: [] }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [diagnosisSuggestions]);

  // Handle diagnosis input with autocomplete
  const handleDiagnosisChange = async (index: number, field: string, value: string) => {
    const newDiagnosis = [...diagnosis];
    newDiagnosis[index] = { ...newDiagnosis[index], [field]: value };
    setDiagnosis(newDiagnosis);
    setErrors({ ...errors, [`diagnosis[${index}].${field}`]: '' });

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
    const newDiagnosis = [...diagnosis];
    newDiagnosis[index] = {
      code: suggestion.code || '',
      description: suggestion.description || suggestion.name || '',
    };
    setDiagnosis(newDiagnosis);
    setDiagnosisSuggestions(prev => ({ ...prev, [index]: [] }));
    setErrors({
      ...errors,
      [`diagnosis[${index}].code`]: '',
      [`diagnosis[${index}].description`]: '',
    });
  };

  // Add/remove diagnosis fields
  const addDiagnosis = () => {
    setDiagnosis([...diagnosis, { code: '', description: '' }]);
  };

  const removeDiagnosis = (index: number) => {
    setDiagnosis(diagnosis.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    delete newErrors[`diagnosis[${index}].code`];
    delete newErrors[`diagnosis[${index}].description`];
    setErrors(newErrors);
    const newSuggestions = { ...diagnosisSuggestions };
    delete newSuggestions[index];
    setDiagnosisSuggestions(newSuggestions);
    const newSearching = { ...isSearchingDiagnosis };
    delete newSearching[index];
    setIsSearchingDiagnosis(newSearching);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
          <FiSearch className="mr-2" />
          Diagnosis
        </h4>
        <button
          type="button"
          onClick={addDiagnosis}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm flex items-center"
        >
          <FiPlus className="mr-1" />
          Add
        </button>
      </div>
      {diagnosis.map((diag, index) => (
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
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <ul className="absolute z-20 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl mt-2 max-h-60 overflow-auto shadow-lg"
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
                    className="p-4 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100 first:rounded-t-xl last:rounded-b-xl"
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
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <ul className="absolute z-20 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl mt-2 max-h-60 overflow-auto shadow-lg"
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
                    className="p-4 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100 first:rounded-t-xl last:rounded-b-xl"
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
          {diagnosis.length > 1 && (
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => removeDiagnosis(index)}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DiagnosisInput;