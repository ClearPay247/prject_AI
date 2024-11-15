import React, { useState, useEffect } from 'react';
import { Search, Building2, Database, Bot, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PersonalDetails } from './crm/PersonalDetails';
import { AccountDetails } from './crm/AccountDetails';
import { PhoneNumbers } from './crm/PhoneNumbers';
import { Notes } from './crm/Notes';
import { Account } from './crm/types';
import { supabase } from '../../lib/supabase';
import AccountPool from './crm/AccountPool';

interface AccountsPageProps {
  isAdmin?: boolean;
}

const AccountsPage: React.FC<AccountsPageProps> = ({ isAdmin = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showAccountPool, setShowAccountPool] = useState(true);

  // Pool state
  const [poolAccounts, setPoolAccounts] = useState<Account[]>([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolFilters, setPoolFilters] = useState({
    status: 'new',
    balanceMin: '',
    balanceMax: '',
    limit: '50',
    originalCreditor: ''
  });

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedAccount || poolAccounts.length === 0) return;

      const currentIndex = poolAccounts.findIndex(a => a.id === selectedAccount.id);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex === 0 ? poolAccounts.length - 1 : currentIndex - 1;
        setSelectedAccount(poolAccounts[prevIndex]);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex === poolAccounts.length - 1 ? 0 : currentIndex + 1;
        setSelectedAccount(poolAccounts[nextIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowAccountPool(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAccount, poolAccounts]);

  const loadAccountPool = async () => {
    setPoolLoading(true);
    setError('');

    try {
      let query = supabase
        .from('accounts')
        .select(`
          *,
          client:clients (
            name
          ),
          phone_numbers (
            id,
            number,
            status
          )
        `)
        .eq('status', poolFilters.status)
        .order('created_at', { ascending: false })
        .limit(parseInt(poolFilters.limit));

      if (poolFilters.balanceMin) {
        query = query.gte('current_balance', parseFloat(poolFilters.balanceMin));
      }
      if (poolFilters.balanceMax) {
        query = query.lte('current_balance', parseFloat(poolFilters.balanceMax));
      }
      if (poolFilters.originalCreditor) {
        query = query.ilike('original_creditor', `%${poolFilters.originalCreditor}%`);
      }

      const { data, error: searchError } = await query;

      if (searchError) throw searchError;

      if (data) {
        const formattedAccounts = data.map(account => ({
          id: account.id,
          firstName: account.debtor_first_name || '',
          lastName: account.debtor_last_name || '',
          accountNumber: account.account_number,
          clientAccountNumber: account.original_account_number,
          originalCreditor: account.original_creditor,
          dateOpened: account.open_date,
          lastPaymentDate: '',
          lastPaymentAmount: 0,
          accountStatus: account.status,
          accountBalance: account.current_balance || 0,
          ssn: account.ssn,
          dob: account.date_of_birth,
          email: account.email,
          address: account.address,
          city: account.city,
          state: account.state,
          zipCode: account.zip_code,
          phoneNumbers: account.phone_numbers || [],
          notes: account.important_notes ? [{
            id: `note-${account.id}`,
            text: account.important_notes,
            createdBy: 'System',
            createdAt: new Date().toLocaleString()
          }] : [],
          importantNotes: account.important_notes || '',
          client: account.client
        }));

        setPoolAccounts(formattedAccounts);
        // Auto-select first account
        if (formattedAccounts.length > 0) {
          setSelectedAccount(formattedAccounts[0]);
          setShowAccountPool(false);
        }
      }
    } catch (err) {
      console.error('Pool loading error:', err);
      setError('Failed to load account pool');
    } finally {
      setPoolLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setSelectedAccount(null);
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);
    setSelectedAccount(null);

    try {
      // Clean the search term to handle different formats
      const cleanedSearch = value.replace(/\D/g, '');
      let accounts: any[] = [];

      // If it looks like a phone number (7+ digits), search phone_numbers first
      if (cleanedSearch.length >= 7) {
        const { data: phoneData, error: phoneError } = await supabase
          .from('phone_numbers')
          .select(`
            account_id,
            accounts (
              id,
              account_number,
              original_account_number,
              debtor_name,
              debtor_first_name,
              debtor_middle_name,
              debtor_last_name,
              address,
              city,
              state,
              zip_code,
              ssn,
              date_of_birth,
              email,
              current_balance,
              original_creditor,
              status,
              open_date,
              important_notes,
              phone_numbers (
                id,
                number,
                status
              )
            )
          `)
          .ilike('number', `%${cleanedSearch}%`);

        if (phoneError) throw phoneError;

        if (phoneData) {
          accounts = phoneData
            .filter(pd => pd.accounts) // Filter out any null accounts
            .map(pd => pd.accounts);
        }
      }

      // If no results from phone search or not a phone number, search other fields
      if (accounts.length === 0) {
        const { data, error: searchError } = await supabase
          .from('accounts')
          .select(`
            *,
            phone_numbers (
              id,
              number,
              status
            )
          `)
          .or(`account_number.ilike.%${value}%,ssn.ilike.%${value}%,debtor_name.ilike.%${value}%`)
          .order('created_at', { ascending: false })
          .limit(50);

        if (searchError) throw searchError;
        if (data) accounts = data;
      }

      if (accounts.length > 0) {
        const formattedAccounts = accounts.map(account => ({
          id: account.id,
          firstName: account.debtor_first_name || '',
          lastName: account.debtor_last_name || '',
          accountNumber: account.account_number,
          clientAccountNumber: account.original_account_number,
          originalCreditor: account.original_creditor,
          dateOpened: account.open_date,
          lastPaymentDate: '',
          lastPaymentAmount: 0,
          accountStatus: account.status,
          accountBalance: account.current_balance || 0,
          ssn: account.ssn,
          dob: account.date_of_birth,
          email: account.email,
          address: account.address,
          city: account.city,
          state: account.state,
          zipCode: account.zip_code,
          phoneNumbers: account.phone_numbers || [],
          notes: account.important_notes ? [{
            id: `note-${account.id}`,
            text: account.important_notes,
            createdBy: 'System',
            createdAt: new Date().toLocaleString()
          }] : [],
          importantNotes: account.important_notes || '',
          client: account.client
        }));

        setSearchResults(formattedAccounts);
        if (formattedAccounts.length === 1) {
          setSelectedAccount(formattedAccounts[0]);
          setShowAccountPool(false);
        }
      } else {
        setSearchResults([]);
        setError('No accounts found matching your search');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search accounts');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateAccounts = (direction: 'prev' | 'next') => {
    if (!selectedAccount || poolAccounts.length === 0) return;
    
    const currentIndex = poolAccounts.findIndex(a => a.id === selectedAccount.id);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? poolAccounts.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === poolAccounts.length - 1 ? 0 : currentIndex + 1;
    }

    setSelectedAccount(poolAccounts[newIndex]);
  };

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowAccountPool(false);
  };

  return (
    <div className="space-y-6">
      {showAccountPool ? (
        <>
          {/* Account Pool */}
          <AccountPool
            accounts={poolAccounts}
            loading={poolLoading}
            filters={poolFilters}
            onFilterChange={setPoolFilters}
            onLoadAccounts={loadAccountPool}
            onSelectAccount={handleSelectAccount}
            selectedAccount={selectedAccount}
            error={error}
          />

          {/* Search Bar */}
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by phone, SSN, or account number..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
                data-lpignore="true"
                spellCheck="false"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>
          </div>
        </>
      ) : (
        /* Full Account View */
        <>
          {/* Navigation Header */}
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 mb-6">
            <button
              onClick={() => setShowAccountPool(true)}
              className="text-gray-400 hover:text-white transition-colors flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Account Pool
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateAccounts('prev')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-gray-400">
                {poolAccounts.findIndex(a => a.id === selectedAccount?.id) + 1} of {poolAccounts.length}
              </span>
              <button
                onClick={() => navigateAccounts('next')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div key="personal-details">
              <PersonalDetails account={selectedAccount!} onUpdate={setSelectedAccount} />
            </div>
            <div key="account-details">
              <AccountDetails account={selectedAccount!} onUpdate={setSelectedAccount} isAdmin={isAdmin} />
            </div>
            <div key="phone-numbers" className="md:col-span-2">
              <PhoneNumbers account={selectedAccount!} onUpdate={setSelectedAccount} />
            </div>
            <div key="notes" className="md:col-span-2">
              <Notes account={selectedAccount!} onUpdate={setSelectedAccount} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountsPage;