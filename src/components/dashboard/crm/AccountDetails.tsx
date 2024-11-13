import React from 'react';
import { Account } from './types';
import { Building2 } from 'lucide-react';

interface AccountDetailsProps {
  account: Account;
  onUpdate: (account: Account) => void;
  isAdmin?: boolean;
}

const accountStatusOptions = [
  '[Open] - Online Login No Pay',
  'Paid',
  'Settled',
  'Uncollectible',
  'In Progress',
  'Legal',
  'Disputed'
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const AccountDetails: React.FC<AccountDetailsProps> = ({ account, onUpdate, isAdmin = false }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Account Details</h3>
      
      {isAdmin && account.client && (
        <div className="mb-4 flex items-center bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20">
          <Building2 className="h-5 w-5 text-blue-400 mr-2" />
          <span className="text-blue-100 font-medium">{account.client.name}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Account #</label>
          <input
            type="text"
            value={account.accountNumber || ''}
            readOnly
            className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Client Account #</label>
          <input
            type="text"
            value={account.clientAccountNumber || ''}
            readOnly
            className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Original Creditor</label>
        <input
          type="text"
          value={account.originalCreditor || ''}
          readOnly
          className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Account Status</label>
          <select
            value={account.accountStatus || ''}
            onChange={(e) => onUpdate({ ...account, accountStatus: e.target.value })}
            className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {accountStatusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Account Balance</label>
          <input
            type="text"
            value={formatCurrency(account.accountBalance || 0)}
            readOnly
            className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Date Opened</label>
          <input
            type="text"
            value={account.dateOpened || ''}
            readOnly
            className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Last Payment</label>
          <input
            type="text"
            value={account.lastPaymentDate || ''}
            readOnly
            className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
          <label className="block text-sm font-medium text-blue-400 mb-2">
            Important Notes
          </label>
          <textarea
            value={account.importantNotes || ''}
            onChange={(e) => onUpdate({ ...account, importantNotes: e.target.value })}
            className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Add important notes about this account..."
          />
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;