import React, { useState } from 'react';
import { Search, Building2, Database, Bot, AlertCircle } from 'lucide-react';
import { PersonalDetails } from './crm/PersonalDetails';
import { AccountDetails } from './crm/AccountDetails';
import { PhoneNumbers } from './crm/PhoneNumbers';
import { Notes } from './crm/Notes';
import { Account } from './crm/types';
import { supabase } from '../../lib/supabase';

const AccountsPage: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

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
        const { data, error: phoneError } = await supabase
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
              client:clients (
                name
              ),
              phone_numbers (
                id,
                number,
                status
              )
            )
          `)
          .ilike('number', `%${cleanedSearch}%`);

          const phoneData: any = data;

        if (phoneError) throw phoneError;

        if (phoneData) {
          // Filter out duplicates based on account_number
          const uniqueAccounts = new Map();
          phoneData
            .filter(pd => pd.accounts)
            .forEach(pd => {
              if (!uniqueAccounts.has(pd.accounts.accountNumber)) {
                uniqueAccounts.set(pd.accounts.accountNumber, pd.accounts);
              }
            });
          accounts = Array.from(uniqueAccounts.values());
        }
      }

      // If no results from phone search or not a phone number, search other fields
      if (accounts.length === 0) {
        const { data, error: searchError } = await supabase
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

  return (
    <div className="space-y-6">
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

      {/* Account Details Grid */}
      {selectedAccount && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PersonalDetails account={selectedAccount} onUpdate={setSelectedAccount} />
            <AccountDetails account={selectedAccount} onUpdate={setSelectedAccount} isAdmin={isAdmin} />
          </div>

          <PhoneNumbers account={selectedAccount} onUpdate={setSelectedAccount} />
          <Notes account={selectedAccount} onUpdate={setSelectedAccount} />
        </div>
      )}

      {/* Search Results */}
      {!selectedAccount && hasSearched && (
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Search Results</h3>
          {searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Database className="h-16 w-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">
                No accounts found matching your search
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccount(account)}
                  className="w-full text-left bg-gray-900/50 hover:bg-gray-700/50 p-4 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">
                        {account.firstName} {account.lastName}
                      </div>
                      <div className="text-sm text-gray-400">
                        Account: {account.accountNumber}
                      </div>
                      {isAdmin && account.client && (
                        <div className="text-sm text-blue-400 mt-1">
                          Client: {account.client.name}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 font-medium">
                        ${account.accountBalance.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">
                        {account.phoneNumbers.length} phone numbers
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bot className="h-16 w-16 text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">
            Enter a search term to find accounts
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Search by phone number, SSN, or account number
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;