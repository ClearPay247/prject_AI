import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import FieldMappingRow from './import/FieldMappingRow';
import SaveTemplateModal from './import/SaveTemplateModal';
import LoadTemplateModal from './import/LoadTemplateModal';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (accounts: any[], phoneNumberMap: Record<string, string[]>) => void;
  headers: string[];
  csvData: any[];
}

const standardFields = [
  { value: 'debtor_first_name', label: 'First Name' },
  { value: 'debtor_middle_name', label: 'Middle Name' },
  { value: 'debtor_last_name', label: 'Last Name' },
  { value: 'original_account_number', label: 'Original Account Number' },
  { value: 'original_creditor', label: 'Original Creditor' },
  { value: 'current_balance', label: 'Current Balance' },
  { value: 'phone_number', label: 'Phone Number' },
  { value: 'phone_number_2', label: 'Phone Number 2' },
  { value: 'phone_number_3', label: 'Phone Number 3' },
  { value: 'email', label: 'Email' },
  { value: 'ssn', label: 'SSN' },
  { value: 'address', label: 'Address' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'zip_code', label: 'ZIP Code' },
  { value: 'date_of_birth', label: 'Date of Birth' },
  { value: 'open_date', label: 'Open Date' },
  { value: 'charge_off_date', label: 'Charge Off Date' },
  { value: 'credit_score', label: 'Credit Score' },
  { value: 'important_notes', label: 'Important Notes' }
];

const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  headers,
  csvData
}) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [skippedFields, setSkippedFields] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showLoadTemplate, setShowLoadTemplate] = useState(false);
  const [isAutoMapping, setIsAutoMapping] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients');
    }
  };

  const handleAutoMap = async () => {
    setIsAutoMapping(true);
    const newMappings: Record<string, string> = {};
    
    headers.forEach(header => {
      // Try exact match first
      let match = standardFields.find(field => 
        field.label.toLowerCase() === header.toLowerCase() ||
        field.value.toLowerCase() === header.toLowerCase()
      );

      // If no exact match, try fuzzy matching
      if (!match) {
        const headerWords = header.toLowerCase().split(/[_\s]+/);
        match = standardFields.find(field => {
          const fieldWords = field.label.toLowerCase().split(/[_\s]+/);
          return headerWords.some(word => 
            fieldWords.some(fieldWord => fieldWord.includes(word) || word.includes(fieldWord))
          );
        });
      }

      if (match) {
        newMappings[header] = match.value;
      }
    });

    // Update the mappings state
    setMappings(newMappings);
    setIsAutoMapping(false);
  };

  const handleImport = async () => {
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }

    const accounts: any[] = [];
    const phoneNumberMap: Record<string, string[]> = {};

    csvData.forEach(row => {
      const account: any = {};
      const phoneNumbers: string[] = [];

      Object.entries(mappings).forEach(([csvField, dbField]) => {
        if (dbField.startsWith('phone_number')) {
          if (row[csvField]) {
            phoneNumbers.push(row[csvField].replace(/\D/g, ''));
          }
        } else {
          account[dbField] = row[csvField];
        }
      });

      // Generate unique account number if not provided
      const accountNumber = account.account_number || 
        `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      account.account_number = accountNumber;

      // Store phone numbers for this account
      if (phoneNumbers.length > 0) {
        phoneNumberMap[accountNumber] = phoneNumbers;
      }

      accounts.push(account);
    });

    try {
      await onConfirm(accounts, phoneNumberMap);
      onClose();
    } catch (err) {
      console.error('Import failed:', err);
      setError('Failed to import accounts');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Map CSV Fields</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Client
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowLoadTemplate(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Load Template
            </button>
            <button
              onClick={() => setShowSaveTemplate(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Save Template
            </button>
            <button
              onClick={handleAutoMap}
              disabled={isAutoMapping}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAutoMapping ? 'animate-spin' : ''}`} />
              Auto-Map Fields
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {headers.map((header) => (
            <FieldMappingRow
              key={header}
              header={header}
              mapping={mappings[header]}
              onChange={(value) => {
                if (value === 'skip') {
                  setSkippedFields(prev => [...prev, header]);
                  const newMappings = { ...mappings };
                  delete newMappings[header];
                  setMappings(newMappings);
                } else {
                  setMappings(prev => ({
                    ...prev,
                    [header]: value
                  }));
                  setSkippedFields(prev => prev.filter(h => h !== header));
                }
              }}
              standardFields={standardFields}
              customFields={[]}
              usedMappings={new Set(Object.values(mappings))}
              sampleData={csvData[0]?.[header]}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Import Accounts
          </button>
        </div>

        <SaveTemplateModal
          isOpen={showSaveTemplate}
          onClose={() => setShowSaveTemplate(false)}
          onSave={async (name) => {
            try {
              const { error } = await supabase
                .from('mapping_templates')
                .insert({
                  name,
                  client_id: selectedClient,
                  mappings
                });

              if (error) throw error;
              setShowSaveTemplate(false);
            } catch (err) {
              console.error('Failed to save template:', err);
              setError('Failed to save template');
            }
          }}
        />

        <LoadTemplateModal
          isOpen={showLoadTemplate}
          onClose={() => setShowLoadTemplate(false)}
          clientId={selectedClient}
          onLoad={(template) => {
            setMappings(template.mappings);
            setShowLoadTemplate(false);
          }}
        />
      </div>
    </div>
  );
};

export default BatchImportModal;