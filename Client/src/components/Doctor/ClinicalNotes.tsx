import React from 'react';
import { FiUser } from 'react-icons/fi';

interface ClinicalNotesProps {
  subjective: string;
  setSubjective: (value: string) => void;
  objective: string;
  setObjective: (value: string) => void;
}

const ClinicalNotes: React.FC<ClinicalNotesProps> = ({
  subjective,
  setSubjective,
  objective,
  setObjective
}) => {
  return (
    <div className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 flex items-center">
          <FiUser className="mr-2" />
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
              value={subjective}
              onChange={e => setSubjective(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
              placeholder="Patient reports symptoms (e.g., fever, diarrhea)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Objective Notes
            </label>
            <textarea
              value={objective}
              onChange={e => setObjective(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
              placeholder="Clinical observations (e.g., BP 120/80, HR 78 bpm)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalNotes;