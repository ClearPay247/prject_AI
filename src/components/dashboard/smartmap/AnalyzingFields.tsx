import React from 'react';
import { Bot } from 'lucide-react';

const AnalyzingFields: React.FC = () => {
  return (
    <div className="text-center p-8">
      <Bot className="h-16 w-16 mx-auto mb-4 text-blue-500 animate-pulse" />
      <h3 className="text-xl font-semibold text-white mb-2">
        Analyzing CSV Fields
      </h3>
      <p className="text-gray-400">
        Our AI is analyzing your CSV fields to suggest the best mappings...
      </p>
    </div>
  );
};

export default AnalyzingFields;