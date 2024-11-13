import React from 'react';
import { HelpCircle } from 'lucide-react';

interface FieldMappingRowProps {
  header: string;
  mapping?: string;
  onChange: (value: string) => void;
  standardFields: Array<{ value: string; label: string }>;
  customFields: Array<{ value: string; label: string }>;
  usedMappings: Set<string>;
  confidence?: number;
  sampleData?: string;
}

const FieldMappingRow: React.FC<FieldMappingRowProps> = ({
  header,
  mapping,
  onChange,
  standardFields,
  customFields,
  usedMappings,
  confidence,
  sampleData
}) => {
  // Filter out already used mappings except for phone_number and important_notes
  const availableStandardFields = standardFields.filter(
    field => !usedMappings.has(field.value) || 
             field.value === 'phone_number' || 
             field.value === 'important_notes' ||
             field.value === mapping
  );
  
  const availableCustomFields = customFields.filter(
    field => !usedMappings.has(field.value) || field.value === mapping
  );

  return (
    <div className="flex items-center space-x-4 group">
      <div className="flex-1 text-white bg-gray-900/50 p-2 rounded group-hover:bg-gray-900/70 transition-colors">
        <div className="flex justify-between items-center">
          <span>{header}</span>
          {confidence && confidence > 0.5 && (
            <span className="text-xs text-green-400">
              {Math.round(confidence * 100)}% match
            </span>
          )}
        </div>
        {sampleData && (
          <div className="text-xs text-gray-400 mt-1">
            Sample: {sampleData}
          </div>
        )}
      </div>
      <div className="text-white">→</div>
      <div className="flex-1">
        <select
          className={`w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border transition-colors ${
            mapping 
              ? 'border-green-500/50 hover:border-green-500'
              : 'border-gray-700 hover:border-blue-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          value={mapping || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select mapping...</option>
          <option value="skip">Skip this field</option>
          <option value="add_to_important_notes">Add to Important Notes</option>
          <option value="phone_number">Add to Phone Numbers</option>
          
          {availableStandardFields.length > 0 && (
            <optgroup label="Standard Fields">
              {availableStandardFields.map(field => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </optgroup>
          )}
          
          {availableCustomFields.length > 0 && (
            <optgroup label="Custom Fields">
              {availableCustomFields.map(field => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
    </div>
  );
};

export default FieldMappingRow;