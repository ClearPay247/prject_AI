import React from 'react';
import { Calendar, Bot, Clock, Phone, Volume2 } from 'lucide-react';

interface ScheduledCallsProps {
  scheduledCalls: any[];
}

export const ScheduledCalls: React.FC<ScheduledCallsProps> = ({ scheduledCalls }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-xl font-semibold text-white">Today's Schedule</h3>
        </div>
        <div className="flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg">
          <Bot className="h-5 w-5" />
          <span>{scheduledCalls.length} Calls Planned</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-700">
              <th className="pb-3 text-gray-400 font-medium">Time (Local)</th>
              <th className="pb-3 text-gray-400 font-medium">Account</th>
              <th className="pb-3 text-gray-400 font-medium">Phone</th>
              <th className="pb-3 text-gray-400 font-medium">Timezone</th>
              <th className="pb-3 text-gray-400 font-medium">Voice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {scheduledCalls.slice(0, 5).map((call, index) => (
              <tr key={index} className="hover:bg-gray-700/30">
                <td className="py-3">
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-4 w-4 mr-2" />
                    {call.planned_time}
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
                <td className="py-3 text-gray-300">{call.timezone}</td>
                <td className="py-3">
                  <div className="flex items-center text-gray-300">
                    <Volume2 className="h-4 w-4 mr-2" />
                    {call.voice}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {scheduledCalls.length > 5 && (
          <div className="mt-4 text-center">
            <button className="text-blue-400 hover:text-blue-300">
              View all {scheduledCalls.length} scheduled calls
            </button>
          </div>
        )}
      </div>
    </div>
  );
};