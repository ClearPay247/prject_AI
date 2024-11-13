import React from 'react';
import { X, Building2, RefreshCw } from 'lucide-react';

interface FieldMappingHeaderProps {
  onClose: () => void;
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
  onAutoMap: () => void;
  clients: Array<{ id: string; name: string }>;
  error?: string;
  isAutoMapping: boolean;
}

const FieldMappingHeader: React.FC<FieldMappingHeaderProps> = ({
  onClose,
  selectedClientId,
  onClientChange,
  onAutoMap,
  clients,
  error,
  isAutoMapping
}) => {
  return (
    <div className="p-6 border-b border-gray-700">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Map CSV Fields</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Client
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={selectedClientId}
            onChange={(e) => onClientChange(e.target.value)}
            className="w-full bg-gray-900/50 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a client...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onAutoMap}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isAutoMapping ? 'animate-spin' : ''}`} />
          Auto-Map Fields
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default FieldMappingHeader;