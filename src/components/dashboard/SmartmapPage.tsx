import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, Check, Bot, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';
import { accountService } from '../../lib/database';
import { analyzeCSVFields } from '../../services/openai';
import { supabase } from '../../lib/supabase';
import ImportHistory from './smartmap/ImportHistory';
import FileUpload from './smartmap/FileUpload';
import AnalyzingFields from './smartmap/AnalyzingFields';
import FieldMapping from './smartmap/FieldMapping';

const SmartmapPage: React.FC = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvFields, setCsvFields] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyze' | 'review' | 'import'>('upload');
  const [importHistory, setImportHistory] = useState<any[]>([]);
  const [isRollingBack, setIsRollingBack] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchImportHistory();
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

  const fetchImportHistory = async () => {
    try {
      const history = await accountService.getImportHistory();
      setImportHistory(history || []);
    } catch (err) {
      console.error('Failed to fetch import history:', err);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          if (results.data.length > 0) {
            setCsvData(results.data);
            const fields = Object.keys(results.data[0]);
            setCsvFields(fields);
            setCurrentStep('analyze');
            await analyzeAndMapFields(fields, results.data[0]);
          }
        },
        error: (error) => {
          setError(`Failed to parse CSV: ${error.message}`);
        }
      });
    } catch (err) {
      setError('Failed to read file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
  });

  const analyzeAndMapFields = async (fields: string[], sampleData: any) => {
    setIsAnalyzing(true);
    setError('');
    
    try {
      const suggestedMappings = await analyzeCSVFields(fields, sampleData);
      setMappings(suggestedMappings);
      setCurrentStep('review');
    } catch (err) {
      console.error('Field analysis error:', err);
      setError('Failed to analyze CSV fields. Please map fields manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImport = async () => {
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }

    setIsImporting(true);
    setError('');
    setSuccess('');

    try {
      const accounts = csvData.map(row => {
        const account: any = {
          client_id: selectedClient
        };
        const phoneNumbers: string[] = [];
        const importantNotes: string[] = [];

        Object.entries(mappings).forEach(([csvField, dbField]) => {
          if (dbField === 'phone_number') {
            if (row[csvField]) phoneNumbers.push(row[csvField]);
          } else if (dbField === 'important_notes') {
            if (row[csvField]) importantNotes.push(`${csvField}: ${row[csvField]}`);
          } else {
            account[dbField] = row[csvField];
          }
        });

        // Combine all important notes
        if (importantNotes.length > 0) {
          account.important_notes = importantNotes.join('\n');
        }

        return { account, phoneNumbers };
      });

      const phoneNumberMap: Record<string, string[]> = {};
      accounts.forEach(({ account, phoneNumbers }) => {
        if (account.account_number) {
          phoneNumberMap[account.account_number] = phoneNumbers;
        }
      });

      await accountService.batchImportAccounts(
        accounts.map(a => a.account),
        phoneNumberMap
      );

      setSuccess(`Successfully imported ${accounts.length} accounts`);
      setCsvData([]);
      setCsvFields([]);
      setMappings({});
      setCurrentStep('upload');
      await fetchImportHistory();
    } catch (err) {
      console.error('Import failed:', err);
      setError('Failed to import accounts. Please check your data and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleRollback = async (importId: string) => {
    if (confirm('Are you sure you want to undo this import? This action cannot be undone.')) {
      setIsRollingBack(true);
      try {
        await accountService.rollbackImport(importId);
        await fetchImportHistory();
        setSuccess('Import successfully rolled back');
      } catch (err) {
        setError('Failed to rollback import');
      } finally {
        setIsRollingBack(false);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <FileUpload
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
          />
        );
      case 'analyze':
        return <AnalyzingFields />;
      case 'review':
        return (
          <FieldMapping
            csvFields={csvFields}
            mappings={mappings}
            onMappingChange={(csvField, dbField) => {
              setMappings(prev => ({
                ...prev,
                [csvField]: dbField
              }));
            }}
            selectedClient={selectedClient}
            clients={clients}
            onClientChange={setSelectedClient}
            onCancel={() => {
              setCsvData([]);
              setCsvFields([]);
              setMappings({});
              setCurrentStep('upload');
            }}
            onImport={handleImport}
            isImporting={isImporting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Smart Import</h2>
      </div>

      {error && (
        <div className="flex items-center bg-red-500/10 text-red-400 px-4 py-3 rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center bg-green-500/10 text-green-400 px-4 py-3 rounded-lg">
          <Check className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {renderStep()}

      <ImportHistory 
        imports={importHistory}
        onRollback={handleRollback}
        isRollingBack={isRollingBack}
      />
    </div>
  );
};

export default SmartmapPage;