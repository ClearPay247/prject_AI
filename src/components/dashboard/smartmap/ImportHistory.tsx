import React from 'react';
import { Clock, RotateCcw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ImportRecord {
  id: string;
  timestamp: string;
  client_name: string;
  account_count: number;
  imported_by: string;
}

interface ImportHistoryProps {
  imports: ImportRecord[];
  onRollback: (importId: string) => Promise<void>;
  isRollingBack: boolean;
}

const ImportHistory: React.FC<ImportHistoryProps> = ({ imports, onRollback, isRollingBack }) => {
  if (!imports.length) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="text-center text-gray-400">
          No import history available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Recent Imports</h3>
      <div className="space-y-4">
        {imports.map((importRecord) => (
          <div 
            key={importRecord.id}
            className="bg-gray-900/50 rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center text-white">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                {format(new Date(importRecord.timestamp), 'MMM d, yyyy h:mm a')}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Imported {importRecord.account_count} accounts for {importRecord.client_name}
              </div>
            </div>
            <button
              onClick={() => onRollback(importRecord.id)}
              disabled={isRollingBack}
              className="flex items-center px-3 py-1 text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Undo Import
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImportHistory;