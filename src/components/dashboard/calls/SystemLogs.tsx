import React from 'react';

interface SystemLogsProps {
  logs: string[];
}

export const SystemLogs: React.FC<SystemLogsProps> = ({ logs }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">System Logs</h3>
      <div className="bg-gray-900/50 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
        {logs.map((log, index) => (
          <div key={index} className="text-gray-300 mb-1">{log}</div>
        ))}
      </div>
    </div>
  );
};