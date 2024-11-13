import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, Check, Bot, RefreshCw, Edit2, Building2 } from 'lucide-react';
import Papa from 'papaparse';
import { analyzeCSVFields } from '../../services/openai';
import { getOpenAISettings } from '../../services/openai';
import { accountService } from '../../lib/database';
import { supabase } from '../../lib/supabase';

interface Client {
  id: string;
  name: string;
}

// ... rest of the interfaces remain the same ...

const SmartMap: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  // ... other existing state variables ...

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
      console.error('Failed to fetch clients:', err);
      setError('Failed to load clients');
    }
  };

  const handleImport = async () => {
    if (!selectedClientId) {
      setError('Please select a client before importing');
      return;
    }

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      const mappings = mappedFields.reduce((acc, field) => {
        if (field.dbField !== 'skip') {
          acc[field.csvField] = field.dbField;
        }
        return acc;
      }, {} as Record<string, string>);

      const accounts = csvData.map(row => {
        const account: any = {
          client_id: selectedClientId // Add client_id to each account
        };
        const phoneNumbers: string[] = [];

        Object.entries(mappings).forEach(([csvField, dbField]) => {
          if (dbField === 'phone_number') {
            if (row[csvField]) phoneNumbers.push(row[csvField]);
          } else {
            account[dbField] = row[csvField];
          }
        });

        return { account, phoneNumbers };
      });

      const phoneNumberMap: Record<string, string[]> = {};
      accounts.forEach(({ account, phoneNumbers }) => {
        if (account.account_number && phoneNumbers.length > 0) {
          phoneNumberMap[account.account_number] = phoneNumbers;
        }
      });

      await accountService.batchImportAccounts(
        accounts.map(a => a.account),
        phoneNumberMap
      );

      setSuccess(`Successfully imported ${accounts.length} accounts for ${
        clients.find(c => c.id === selectedClientId)?.name
      }`);
      
      // Reset state after successful import
      setCsvData([]);
      setCsvFields([]);
      setMappedFields([]);
      setUnmappedFields([]);
      setSelectedClientId('');
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import accounts');
    } finally {
      setImporting(false);
    }
  };

  // Add client selection UI at the top of the component's return statement
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">SmartMap</h2>
        <div className="flex items-center space-x-4">
          <Building2 className="h-5 w-5 text-gray-400" />
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="bg-gray-800/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Client...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Only show file upload if a client is selected */}
      {!selectedClientId ? (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-400">
          Please select a client before proceeding with the import
        </div>
      ) : !csvData.length ? (
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-blue-500/50'}`}>
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-300 mb-2">
            Drag & drop your CSV file here, or click to select
          </p>
          <p className="text-sm text-gray-400">
            Maximum file size: 10MB
          </p>
        </div>
      ) : (
        // ... rest of the existing JSX for mapping interface ...
      )}
    </div>
  );
};

export default SmartMap;