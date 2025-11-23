import React from 'react';
import { FiSearch, FiFilter, FiCheckCircle, FiX } from 'react-icons/fi';

interface PatientFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterGender: string;
  setFilterGender: (gender: string) => void;
  filterVerified: string;
  setFilterVerified: (verified: string) => void;
  clearFilters: () => void;
}

const PatientFilters: React.FC<PatientFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterGender,
  setFilterGender,
  filterVerified,
  setFilterVerified,
  clearFilters
}) => {
  return (
    <div className="mb-6 bg-white dark:bg-gray-800 p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or health card ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <FiFilter className="text-gray-500 dark:text-gray-400 mr-2" />
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <FiCheckCircle className="text-gray-500 dark:text-gray-400 mr-2" />
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Verification Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Not Verified</option>
            </select>
          </div>
          
          {(searchTerm || filterGender !== 'all' || filterVerified !== 'all') && (
            <button
              onClick={clearFilters}
              className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              <FiX className="mr-1" /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientFilters;