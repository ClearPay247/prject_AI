import React from 'react';
import { RefreshCw } from 'lucide-react';

interface FieldMappingProps {
  csvFields: string[];
  mappings: Record<string, string>;
  onMappingChange: (csvField: string, dbField: string) => void;
  selectedClient: string;
  clients: Array<{ id: string; name: string }>;
  onClientChange: (clientId: string) => void;
  onCancel: () => void;
  onImport: () => void;
  isImporting: boolean;
}

const FieldMapping: React.FC<FieldMappingProps> = ({
  csvFields,
  mappings,
  onMappingChange,
  selectedClient,
  clients,
  onClientChange,
  onCancel,
  onImport,
  isImporting
}) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Review Mappings</h3>
        <select
          value={selectedClient}
          onChange={(e) => onClientChange(e.target.value)}
          className="bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Client...</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {csvFields.map((csvField) => (
          <div key={csvField} className="flex items-center space-x-4">
            <div className="flex-1 text-white">{csvField}</div>
            <div className="text-gray-400">→</div>
            <select
              value={mappings[csvField] || ''}
              onChange={(e) => onMappingChange(csvField, e.target.value)}
              className="flex-1 bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Skip Field</option>
              <option value="account_number">Account Number</option>
              <option value="debtor_name">Debtor Name</option>
              <option value="debtor_first_name">First Name</option>
              <option value="debtor_middle_name">Middle Name</option>
              <option value="debtor_last_name">Last Name</option>
              <option value="ssn">SSN</option>
              <option value="phone_number">Phone Number</option>
              <option value="email">Email</option>
              <option value="address">Address</option>
              <option value="city">City</option>
              <option value="state">State</option>
              <option value="zip_code">ZIP Code</option>
              <option value="current_balance">Current Balance</option>
              <option value="original_creditor">Original Creditor</option>
              <option value="open_date">Open Date</option>
              <option value="charge_off_date">Charge Off Date</option>
              <option value="credit_score">Credit Score</option>
              <option value="important_notes">Important Notes</option>
            </select>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onImport}
          disabled={!selectedClient || isImporting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center"
        >
          {isImporting ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            'Import Accounts'
          )}
        </button>
      </div>
    </div>
  );
};

export default FieldMapping;