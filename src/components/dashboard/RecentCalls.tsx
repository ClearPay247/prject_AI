import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Phone, Calendar, Power, Pause, Bot } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getTimezoneFromAreaCode } from '../../utils/timezone';
import { automatedCallService } from '../../services/automatedCalls';
import { ScheduledCalls } from './calls/ScheduledCalls';
import { CallHistory } from './calls/CallHistory';

const RecentCalls: React.FC = () => {
  const [calls, setCalls] = useState<any[]>([]);
  const [scheduledCalls, setScheduledCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [showAllCalls, setShowAllCalls] = useState(false);

  useEffect(() => {
    setIsAutomationRunning(automatedCallService.isAutomationRunning());
    fetchCalls();
    fetchScheduledCalls();

    const unsubscribe = automatedCallService.onScheduleUpdate(() => {
      fetchScheduledCalls();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('call_logs')
        .select(`
          *,
          account:accounts(
            account_number,
            debtor_name
          )
        `)
        .order('call_time', { ascending: false })
        .limit(5);

      if (error) throw error;
      setCalls(data || []);
    } catch (err) {
      console.error('Error fetching calls:', err);
      setError('Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledCalls = async () => {
    try {
      if (!automatedCallService.isAutomationRunning()) {
        setScheduledCalls([]);
        return;
      }

      const { data: accounts, error } = await supabase
        .from('accounts')
        .select(`
          id,
          account_number,
          debtor_name,
          phone_numbers!inner(
            number,
            last_called
          )
        `);

      if (error) throw error;

      if (!accounts || accounts.length === 0) {
        return;
      }

      const schedule: any[] = [];
      const voices = ['nat', 'josh', 'rachel', 'emily'];
      
      accounts?.forEach((account) => {
        account.phone_numbers.forEach((phone: any) => {
          const areaCode = phone.number.substring(0, 3);
          const timezone = getTimezoneFromAreaCode(areaCode);
          const randomHour = Math.floor(Math.random() * 13) + 8;
          const randomMinute = Math.floor(Math.random() * 60);
          
          schedule.push({
            account_id: account.id,
            phone_number: phone.number,
            planned_time: `${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}`,
            timezone,
            voice: voices[Math.floor(Math.random() * voices.length)],
            account: {
              account_number: account.account_number,
              debtor_name: account.debtor_name
            }
          });
        });
      });

      schedule.sort((a, b) => a.planned_time.localeCompare(b.planned_time));
      setScheduledCalls(schedule);
    } catch (err) {
      console.error('Error fetching scheduled calls:', err);
    }
  };

  const toggleAutomation = () => {
    if (isAutomationRunning) {
      automatedCallService.stop();
      setScheduledCalls([]);
    } else {
      automatedCallService.start();
      fetchScheduledCalls();
    }
    setIsAutomationRunning(!isAutomationRunning);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const clearHistory = async () => {
    try {
      const { error } = await supabase
        .from('call_logs')
        .delete()
        .not('id', 'is', null); // Delete all records

      if (error) throw error;
      
      setCalls([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError('Failed to clear call history');
    }
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = searchTerm === '' || 
      call.account?.account_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.account?.debtor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.phone_number?.includes(searchTerm);
    
    const matchesStatus = selectedStatus === 'all' || call.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Recent Calls</h2>
        <div className="flex gap-4">
          <button
            onClick={toggleAutomation}
            className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
              isAutomationRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isAutomationRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Stop Automation
              </>
            ) : (
              <>
                <Power className="h-5 w-5 mr-2" />
                Start Automation
              </>
            )}
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search calls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800/50 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-4 pr-10 py-2 bg-gray-800/50 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="no_answer">No Answer</option>
              <option value="voicemail">Voicemail</option>
              <option value="failed">Failed</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <button
            onClick={clearHistory}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>

      <ScheduledCalls scheduledCalls={scheduledCalls} />
      
      <CallHistory 
        calls={filteredCalls}
        showAllCalls={showAllCalls}
        onToggleShowAll={() => setShowAllCalls(!showAllCalls)}
        formatDuration={formatDuration}
      />
    </div>
  );
};

export default RecentCalls;