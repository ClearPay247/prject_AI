import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface LoadTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (template: any) => void;
  clientId: string;
}

interface Template {
  id: string;
  name: string;
  client_id: string;
  mappings: Record<string, string>;
  created_at: string;
}

const LoadTemplateModal: React.FC<LoadTemplateModalProps> = ({
  isOpen,
  onClose,
  onLoad,
  clientId
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && clientId) {
      fetchTemplates();
    }
  }, [isOpen, clientId]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('mapping_templates')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to load templates');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('mapping_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      await fetchTemplates();
    } catch (err) {
      console.error('Failed to delete template:', err);
      setError('Failed to delete template');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Load Mapping Template</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {templates && templates.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No saved templates found
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-white">{template.name}</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Created: {new Date(template.created_at).toLocaleDateString()}
                </p>
                <button
                  onClick={() => {
                    onLoad(template);
                    onClose();
                  }}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Load Template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadTemplateModal;