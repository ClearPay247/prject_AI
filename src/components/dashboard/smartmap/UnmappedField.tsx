import React from 'react';

interface UnmappedFieldProps {
  field: string;
  editingField: string | null;
  standardFields: Array<{ value: string; label: string }>;
  onMap: (field: string, mapping: string) => void;
  onSkip: (field: string) => void;
  onEdit: (field: string | null) => void;
}

const UnmappedField: React.FC<UnmappedFieldProps> = ({
  field,
  editingField,
  standardFields,
  onMap,
  onSkip,
  onEdit
}) => {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div className="text-white font-medium">{field}</div>
        {editingField === field ? (
          <div className="flex items-center space-x-2">
            <select
              className="bg-gray-800 text-white rounded-lg px-3 py-1 border border-gray-700"
              onChange={(e) => onMap(field, e.target.value)}
            >
              <option value="">Select mapping...</option>
              {standardFields.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <button
              onClick={() => onEdit(null)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(field)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Map Field
            </button>
            <button
              onClick={() => onSkip(field)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnmappedField;