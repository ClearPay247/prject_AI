import React from 'react';
import { Filter, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { Account } from './types';

interface AccountPoolProps {
  accounts: Account[];
  loading: boolean;
  filters: {
    status: string;
    balanceMin: string;
    balanceMax: string;
    limit: string;
    originalCreditor: string;
  };
  onFilterChange: (filters: any) => void;
  onLoadAccounts: () => void;
  onSelectAccount: (account: Account) => void;
  selectedAccount: Account | null;
  error?: string;
}

const AccountPool: React.FC<AccountPoolProps> = ({
  accounts,
  loading,
  filters,
  onFilterChange,
  onLoadAccounts,
  onSelectAccount,
  selectedAccount,
  error
}) => {
  const handleLoadAccounts = () => {
    onLoadAccounts();
    // Auto-select first account when loading
    if (accounts.length > 0) {
      onSelectAccount(accounts[0]);
    }
  };

  const navigateAccounts = (direction: 'prev' | 'next') => {
    if (!selectedAccount || accounts.length === 0) return;
    
    const currentIndex = accounts.findIndex(a => a.id === selectedAccount.id);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? accounts.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === accounts.length - 1 ? 0 : currentIndex + 1;
    }

    onSelectAccount(accounts[newIndex]);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Account Pool Filters</h3>
          <div className="flex items-center space-x-4">
            {selectedAccount && accounts.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateAccounts('prev')}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-gray-400">
                  {accounts.findIndex(a => a.id === selectedAccount.id) + 1} of {accounts.length}
                </span>
                <button
                  onClick={() => navigateAccounts('next')}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
            <button
              onClick={handleLoadAccounts}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Filter className="h-5 w-5 mr-2" />
                  Load Accounts
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="no_contact">No Contact</option>
              <option value="skip">Skip</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Original Creditor
            </label>
            <input
              type="text"
              value={filters.originalCreditor}
              onChange={(e) => onFilterChange({ ...filters, originalCreditor: e.target.value })}
              className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter creditor name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Min Balance
            </label>
            <input
              type="number"
              value={filters.balanceMin}
              onChange={(e) => onFilterChange({ ...filters, balanceMin: e.target.value })}
              className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Balance
            </label>
            <input
              type="number"
              value={filters.balanceMax}
              onChange={(e) => onFilterChange({ ...filters, balanceMax: e.target.value })}
              className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="999999.99"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => onFilterChange({ ...filters, limit: e.target.value })}
              className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="25">25 accounts</option>
              <option value="50">50 accounts</option>
              <option value="100">100 accounts</option>
              <option value="200">200 accounts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">Account Pool</h3>
        </div>

        {error ? (
          <div className="p-6 text-center text-red-400">{error}</div>
        ) : accounts.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No accounts found. Adjust filters and click "Load Accounts" to begin.
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => onSelectAccount(account)}
                className={`w-full text-left p-4 hover:bg-gray-700/30 transition-colors flex items-center justify-between group ${
                  selectedAccount?.id === account.id ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
                }`}
              >
                <div>
                  <div className="text-white font-medium">
                    {account.firstName} {account.lastName}
                  </div>
                  <div className="text-sm text-gray-400">
                    Account: {account.accountNumber}
                  </div>
                  <div className="text-sm text-gray-400">
                    Creditor: {account.originalCreditor || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {account.phoneNumbers.length} phone numbers
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-400 font-medium">
                    ${account.accountBalance.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">
                    Status: {account.accountStatus}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPool;