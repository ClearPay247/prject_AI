import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { accountService } from '../../lib/database';
import Papa from 'papaparse';
import BatchImportModal from './BatchImportModal';

interface ImportResults {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

const UploadAccounts: React.FC = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvFields, setCsvFields] = useState<string[]>([]);
  const [showMapping, setShowMapping] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.data.length > 0) {
            setCsvData(results.data);
            const fields = Object.keys(results.data[0]);
            setCsvFields(fields);
            setShowMapping(true);
          }
        },
        skipEmptyLines: true,
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

  const handleImport = async (mappings: Record<string, string>) => {
    setImporting(true);
    setError('');
    setImportResults(null);

    try {
      const accounts = csvData.map(row => {
        const account: any = {};
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
        phoneNumberMap[account.account_number] = phoneNumbers;
      });

      await accountService.batchImportAccounts(
        accounts.map(a => a.account),
        phoneNumberMap
      );

      setImportResults({
        total: accounts.length,
        successful: accounts.length,
        failed: 0,
        errors: []
      });

      setCsvData([]);
      setCsvFields([]);
      setShowMapping(false);
    } catch (err) {
      console.error('Failed to batch import accounts:', err);
      setImportResults({
        total: csvData.length,
        successful: 0,
        failed: csvData.length,
        errors: [{ row: 0, error: err instanceof Error ? err.message : String(err) }]
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Import Accounts</h2>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6">
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

        {error && (
          <div className="mt-4 flex items-center text-red-400">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <BatchImportModal
          isOpen={showMapping}
          onClose={() => setShowMapping(false)}
          onConfirm={handleImport}
          headers={csvFields}
          csvData={csvData}
        />

        {importResults && (
          <div className="mt-6 bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-2">Import Results</h4>
            <div className="space-y-2">
              <p className="text-gray-300">
                Total Records: {importResults.total}
              </p>
              <p className="text-green-400">
                Successfully Imported: {importResults.successful}
              </p>
              {importResults.failed > 0 && (
                <>
                  <p className="text-red-400">
                    Failed: {importResults.failed}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">Errors:</p>
                    <ul className="list-disc list-inside text-red-400 text-sm">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>Row {error.row + 1}: {error.error}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadAccounts;