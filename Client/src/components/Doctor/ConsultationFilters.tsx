import React from 'react';
import { FiSearch, FiCalendar, FiFilter, FiX } from 'react-icons/fi';

interface ConsultationFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fromDate: string;
  setFromDate: (date: string) => void;
  toDate: string;
  setToDate: (date: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  clearFilters: () => void;
}

const ConsultationFilters: React.FC<ConsultationFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  statusFilter,
  setStatusFilter,
  clearFilters
}) => {
  return (
    <div className="mb-6 bg-white dark:bg-gray-800 p-5 dark:border-gray-700">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by diagnosis, notes, medications, tests, status, patient ID, or report names"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <FiCalendar className="text-gray-500 dark:text-gray-400 mr-2" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="mx-2 text-gray-500 dark:text-gray-400">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center">
            <FiFilter className="text-gray-500 dark:text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          
          {(searchTerm || fromDate || toDate || statusFilter !== 'ALL') && (
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

export default ConsultationFilters;