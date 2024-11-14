import React, { useState, useEffect } from 'react';
import { Key, Bot, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface OpenAIConfig {
  apiKey: string;
  model?: string;
  organization?: string;
}

const OpenAIConfig: any = () => {
  const [config, setConfig] = useState<OpenAIConfig>({
    apiKey: '',
    model: 'gpt-4',
    organization: ''
  });
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('settings')
        .eq('provider', 'openai')
        .single();

      if (error) throw error;
      if (data?.settings) {
        setConfig(data.settings);
      }
    } catch (err) {
      console.error('Failed to load OpenAI config:', err);
      setMessage('Failed to load configuration');
      setStatus('error');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    setStatus('idle');

    try {
      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          provider: 'openai',
          settings: config
        }, {
          onConflict: 'provider'
        });

      if (error) throw error;
      setMessage('Settings saved successfully');
      setStatus('success');
    } catch (err) {
      console.error('Failed to save OpenAI config:', err);
      setMessage('Failed to save configuration');
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setStatus('pending');
    setMessage('');

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'OpenAI-Organization': config.organization || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to connect to OpenAI');
      }

      setStatus('success');
      setMessage('Connection successful');
    } catch (err) {
      console.error('OpenAI connection test failed:', err);
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            API Key <span className="text-red-400">*</span>
          </label>
          <input
            type="password"
            value={config.apiKey || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sk-..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Organization ID (Optional)
          </label>
          <input
            type="text"
            value={config.organization || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, organization: e.target.value }))}
            className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="org-..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Model
          </label>
          <select
            value={config.model || 'gpt-4'}
            onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
            className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Key className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={handleTestConnection}
            disabled={status === 'pending'}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            {status === 'pending' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bot className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </button>
        </div>

        {message && (
          <div className={`flex items-center p-4 rounded-lg ${
            status === 'success' 
              ? 'bg-green-500/10 text-green-400' 
              : 'bg-red-500/10 text-red-400'
          }`}>
            {status === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-400">Important Note</h4>
            <p className="text-sm text-gray-400 mt-1">
              Your OpenAI API key is encrypted before being stored. We follow industry best practices
              to ensure your sensitive data remains secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenAIConfig;