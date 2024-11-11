import React from 'react';
import { format, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { Phone, Calendar, Clock, Play, Download } from 'lucide-react';
import { CallStatusIcon } from './CallStatusIcon';

interface CallHistoryProps {
  calls: any[];
  showAllCalls: boolean;
  onToggleShowAll: () => void;
  formatDuration: (seconds: number | null) => string;
}

export const CallHistory: React.FC<CallHistoryProps> = ({ 
  calls, 
  showAllCalls, 
  onToggleShowAll,
  formatDuration 
}) => {
  const displayedCalls = showAllCalls ? calls : calls.slice(0, 5);

  const formatCallTime = (timestamp: string) => {
    // Get user's timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Parse the UTC timestamp and convert to local time
    const utcDate = parseISO(timestamp);
    const zonedDate = utcToZonedTime(utcDate, timeZone);
    
    // Format the date in local time
    return format(zonedDate, 'MMM d, h:mm a');
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Call History</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-700">
              <th className="pb-3 text-gray-400 font-medium">Status</th>
              <th className="pb-3 text-gray-400 font-medium">Account</th>
              <th className="pb-3 text-gray-400 font-medium">Phone</th>
              <th className="pb-3 text-gray-400 font-medium">Time</th>
              <th className="pb-3 text-gray-400 font-medium">Duration</th>
              <th className="pb-3 text-gray-400 font-medium">Recording</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {displayedCalls.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No calls found
                </td>
              </tr>
            ) : (
              displayedCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-700/30">
                  <td className="py-3">
                    <div className="flex items-center">
                      <CallStatusIcon status={call.status} />
                      <span className="ml-2 text-gray-300 capitalize">
                        {call.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="text-white">{call.account?.account_number}</div>
                    <div className="text-sm text-gray-400">
                      {call.account?.debtor_name}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center text-gray-300">
                      <Phone className="h-4 w-4 mr-2" />
                      {call.phone_number}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatCallTime(call.call_time)}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center text-gray-300">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatDuration(call.duration)}
                    </div>
                  </td>
                  <td className="py-3">
                    {call.recording_url ? (
                      <div className="flex space-x-2">
                        <a
                          href={call.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Play className="h-4 w-4 text-blue-400" />
                        </a>
                        <a
                          href={call.recording_url}
                          download
                          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4 text-blue-400" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-500">No recording</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {calls.length > 5 && (
          <div className="mt-4 text-center">
            <button 
              onClick={onToggleShowAll}
              className="text-blue-400 hover:text-blue-300"
            >
              {showAllCalls ? 'Show Less' : `View all ${calls.length} calls`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}