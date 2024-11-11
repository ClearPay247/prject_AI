import React, { useState, useEffect } from 'react';
import { Phone, Bot, Calendar, Shield, Plus, Check, AlertCircle, Clock, Volume2, Settings, Trash2, RefreshCw } from 'lucide-react';
import { callRuleService } from '../../lib/database';

interface CallRule {
  id: string;
  rule: string;
  category: string;
  active: boolean;
  created_at: string;
}

const CallSettings: React.FC = () => {
  const [newRule, setNewRule] = useState('');
  const [customRules, setCustomRules] = useState<CallRule[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [workableStatuses] = useState([
    { status: 'new', included: true },
    { status: 'active', included: true },
    { status: 'no_contact', included: true },
    { status: 'skip', included: true },
    { status: 'bankruptcy', included: false },
    { status: 'deceased', included: false },
    { status: 'paying', included: false },
    { status: 'paid', included: false },
    { status: 'lawyer', included: false },
    { status: 'dispute', included: false }
  ]);

  const currentRules = [
    {
      id: 1,
      category: 'Timing',
      rules: [
        'Call accounts once per day at randomized times',
        'Only call between 8am-9pm in debtor\'s timezone (based on area code)',
        'No calls on major holidays (New Year\'s, Memorial Day, Labor Day, Christmas Eve/Day, Thanksgiving)'
      ]
    },
    {
      id: 2,
      category: 'Voice & Number Rotation',
      rules: [
        'Rotate through different Bland AI voices for each debtor daily',
        'Use different phone numbers from Bland AI pool each day',
        'Continue rotation until account status changes'
      ]
    },
    {
      id: 3,
      category: 'Contact Rules',
      rules: [
        'Wait 7 days before calling again if debtor engages (e.g., presses 1 for transfer)',
        'Never call numbers marked as non-workable',
        'Automatically exclude accounts with non-workable statuses'
      ]
    }
  ];

  const holidays = [
    { date: '2024-01-01', name: "New Year's Day" },
    { date: '2024-05-27', name: "Memorial Day" },
    { date: '2024-09-02', name: "Labor Day" },
    { date: '2024-11-28', name: "Thanksgiving" },
    { date: '2024-12-24', name: "Christmas Eve" },
    { date: '2024-12-25', name: "Christmas Day" }
  ];

  useEffect(() => {
    fetchCustomRules();
  }, []);

  const fetchCustomRules = async () => {
    try {
      const rules = await callRuleService.getCustomRules();
      setCustomRules(rules);
    } catch (err) {
      console.error('Error fetching custom rules:', err);
      setError('Failed to load custom rules');
    }
  };

  const handleAddRule = async () => {
    if (!newRule.trim()) {
      setError('Please enter a rule');
      return;
    }

    try {
      const success = await callRuleService.addCustomRule(newRule);
      if (success) {
        setNewRule('');
        setSuccess('Rule added to upcoming improvements');
        await fetchCustomRules();
      } else {
        throw new Error('Failed to add rule');
      }
    } catch (err) {
      setError('Failed to add rule');
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const success = await callRuleService.deleteRule(id);
      if (success) {
        await fetchCustomRules();
      }
    } catch (err) {
      setError('Failed to delete rule');
    }
  };

  const handleClearImplementedRules = async () => {
    try {
      // Delete all custom rules as they've been implemented
      for (const rule of customRules) {
        await callRuleService.deleteRule(rule.id);
      }
      setSuccess('Cleared all implemented rules');
      await fetchCustomRules();
    } catch (err) {
      setError('Failed to clear implemented rules');
    }
  };

  return (
    <div className="space-y-6">
      {/* Workable Statuses */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-white">Account Status Campaign Settings</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {workableStatuses.map((status, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                status.included 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              <span className="capitalize">{status.status.replace('_', ' ')}</span>
              <div className={`h-3 w-3 rounded-full ${status.included ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Current Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentRules.map((section) => (
          <div key={section.id} className="bg-gray-800/50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              {section.category === 'Timing' && <Clock className="h-6 w-6 text-blue-500 mr-2" />}
              {section.category === 'Voice & Number Rotation' && <Volume2 className="h-6 w-6 text-blue-500 mr-2" />}
              {section.category === 'Contact Rules' && <Phone className="h-6 w-6 text-blue-500 mr-2" />}
              <h3 className="text-lg font-semibold text-white">{section.category}</h3>
            </div>
            <ul className="space-y-3">
              {section.rules.map((rule, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Holiday Schedule */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">2024 Holiday Schedule (No Calls)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {holidays.map((holiday, index) => (
            <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="text-gray-300 font-medium">{holiday.name}</div>
              <div className="text-gray-400 text-sm">{new Date(holiday.date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Improvements */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bot className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-white">Upcoming Call Rule Improvements</h3>
          </div>
          {customRules.length > 0 && (
            <button
              onClick={handleClearImplementedRules}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Implemented Rules
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-center text-red-400">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center text-green-400">
            <Check className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="Enter new rule improvement idea..."
              className="flex-1 bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddRule}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Rule
            </button>
          </div>

          <div className="space-y-2">
            {customRules.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                No upcoming improvements yet. Add new rule ideas above.
              </div>
            ) : (
              customRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                >
                  <span className="text-gray-300">{rule.rule}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500 text-sm">Pending Implementation</span>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
        <div className="flex items-start space-x-3">
          <Bot className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-400">System Status</h4>
            <p className="text-sm text-gray-400 mt-1">
              The automated calling system is actively running with these rules. All workable accounts will be processed daily according to these settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallSettings;