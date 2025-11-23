import React from 'react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex px-4 sm:px-6 py-2 overflow-x-auto">
        <button
          type="button"
          className={`py-3 px-4 sm:px-6 font-medium text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'basic' 
              ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        <button
          type="button"
          className={`py-3 px-4 sm:px-6 font-medium text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'clinical' 
              ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('clinical')}
        >
          Clinical Notes
        </button>
        <button
          type="button"
          className={`py-3 px-4 sm:px-6 font-medium text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'meds' 
              ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('meds')}
        >
          Medications
        </button>
        <button
          type="button"
          className={`py-3 px-4 sm:px-6 font-medium text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'tests' 
              ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('tests')}
        >
          Tests
        </button>
        <button
          type="button"
          className={`py-3 px-4 sm:px-6 font-medium text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
            activeTab === 'reports' 
              ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('reports')}
        >
          Medical Reports
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;