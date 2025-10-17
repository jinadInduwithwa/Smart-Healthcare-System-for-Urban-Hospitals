import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

interface SearchResult {
  code?: string;
  name?: string;
  description?: string;
}

interface TestInputProps {
  tests: string[];
  setTests: (tests: string[]) => void;
  errors: { [key: string]: string };
  setErrors: (errors: { [key: string]: string }) => void;
}

const TestInput: React.FC<TestInputProps> = ({
  tests,
  setTests,
  errors,
  setErrors
}) => {
  const [testSuggestions, setTestSuggestions] = useState<{ [index: number]: SearchResult[] }>({});
  const [isSearchingTests, setIsSearchingTests] = useState<{ [index: number]: boolean }>({});
  const testDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
  }, [testSuggestions]);

  // Handle test input with autocomplete
  const handleTestChange = async (index: number, value: string) => {
    const newTests = [...tests];
    newTests[index] = value;
    setTests(newTests);
    setErrors({ ...errors, [`recommendedTests[${index}]`]: '' });

    // For demo purposes, we'll just clear suggestions
    setTestSuggestions(prev => ({ ...prev, [index]: [] }));
    setIsSearchingTests(prev => ({ ...prev, [index]: false }));
  };

  // Select test from suggestions
  const selectTest = (index: number, suggestion: SearchResult) => {
    const newTests = [...tests];
    newTests[index] = suggestion.name || '';
    setTests(newTests);
    setTestSuggestions(prev => ({ ...prev, [index]: [] }));
    setErrors({ ...errors, [`recommendedTests[${index}]`]: '' });
  };

  // Add/remove test fields
  const addTest = () => {
    setTests([...tests, '']);
  };

  const removeTest = (index: number) => {
    setTests(tests.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    delete newErrors[`recommendedTests[${index}]`];
    setErrors(newErrors);
    const newSuggestions = { ...testSuggestions };
    delete newSuggestions[index];
    setTestSuggestions(newSuggestions);
    const newSearching = { ...isSearchingTests };
    delete newSearching[index];
    setIsSearchingTests(newSearching);
  };

  return (
    <div className="">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 flex items-center">
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Recommended Tests
        </h3>
        <button
          type="button"
          onClick={addTest}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900 text-sm flex items-center"
        >
          <FiPlus className="mr-1" />
          Add Test
        </button>
      </div>
      <div className="p-6">
        {tests.map((test, index) => (
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
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <ul className="absolute z-20 w-full max-w-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl mt-2 max-h-60 overflow-auto shadow-lg"
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
                        className="p-4 hover:bg-blue-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100 first:rounded-t-xl last:rounded-b-xl"
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
              {tests.length > 1 && (
                <div className="flex items-center pt-6">
                  <button
                    type="button"
                    onClick={() => removeTest(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestInput;