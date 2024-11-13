import React, { useState, useEffect } from 'react';
import { Search, Building2 } from 'lucide-react';
import { PersonalDetails } from './crm/PersonalDetails';
import { AccountDetails } from './crm/AccountDetails';
import { PhoneNumbers } from './crm/PhoneNumbers';
import { Notes } from './crm/Notes';
import { Account, PhoneNumber, Note } from './crm/types';
import { supabase } from '../../lib/supabase';

const AccountsPage: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchAccounts = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setAccounts([]);
      setSelectedAccount(null);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);

      let query = supabase
        .from('accounts')
        .select(`
          *,
          client:clients(name)
        `);

      // If not admin, only show accounts for the user's client
      if (!isAdmin) {
        const { data: userResponse } = await supabase.auth.getUser();
        if (userResponse?.user?.email) {
          const { data: clientData } = await supabase
            .from('clients')
            .select('id')
            .eq('email', userResponse.user.email)
            .single();

          if (clientData?.id) {
            query = query.eq('client_id', clientData.id);
          }
        }
      }

      // Add search filters
      const searchLower = searchTerm.toLowerCase();
      query = query.or(`
        account_number.ilike.%${searchLower}%,
        debtor_name.ilike.%${searchLower}%,
        ssn.ilike.%${searchLower}%,
        id.in.(
          select account_id from phone_numbers 
          where number.ilike.%${searchLower}%
        )
      `);

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setAccounts(data || []);
      if (data && data.length > 0) {
        setSelectedAccount(data[0]);
      } else {
        setSelectedAccount(null);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts');
      setAccounts([]);
      setSelectedAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchAccounts(term);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-bold text-white">CRM</h2>
          {isAdmin && selectedAccount && (
            <div className="flex items-center bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg">
              <Building2 className="h-5 w-5 mr-2" />
              <span>{selectedAccount.client?.name || 'Unassigned'}</span>
            </div>
          )}
        </div>
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

      {error && (
        <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!hasSearched ? (
        <div className="text-center text-gray-400 py-8">
          Enter a search term to find accounts
        </div>
      ) : selectedAccount ? (
        <>
          {/* Account Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div key="personal-details">
              <PersonalDetails account={selectedAccount} onUpdate={setSelectedAccount} />
            </div>
            <div key="account-details">
              <AccountDetails account={selectedAccount} onUpdate={setSelectedAccount} />
            </div>
          </div>

          {/* Phone Numbers */}
          <div key="phone-numbers">
            <PhoneNumbers account={selectedAccount} onUpdate={setSelectedAccount} />
          </div>

          {/* Notes */}
          <div key="notes">
            <Notes account={selectedAccount} onUpdate={setSelectedAccount} />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400 py-8">
          No accounts found matching your search
        </div>
      )}
    </div>
  );
};

export default AccountsPage;