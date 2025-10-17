import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PatientPaginationProps {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
  indexOfFirstPatient: number;
  indexOfLastPatient: number;
  totalPatients: number;
}

const PatientPagination: React.FC<PatientPaginationProps> = ({
  currentPage,
  totalPages,
  paginate,
  indexOfFirstPatient,
  indexOfLastPatient,
  totalPatients
}) => {
  return (
    <>
      {/* Results Summary */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-600 dark:text-gray-300">
          Showing <span className="font-medium">{indexOfFirstPatient + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(indexOfLastPatient, totalPatients)}
          </span>{' '}
          of <span className="font-medium">{totalPatients}</span> patients
        </p>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-gray-600 dark:text-gray-300 text-sm">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Page numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Show first, last, current, and nearby pages
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              
              // Show ellipsis for skipped pages
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return (
                  <span key={pageNum} className="px-2 text-gray-400 dark:text-gray-600">
                    ...
                  </span>
                );
              }
              
              return null;
            })}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientPagination;