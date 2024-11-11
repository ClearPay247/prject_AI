import React from 'react';
import { CheckCircle2, PhoneOff, Voicemail, XCircle, AlertCircle } from 'lucide-react';

interface CallStatusIconProps {
  status: string;
}

export const CallStatusIcon: React.FC<CallStatusIconProps> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'no_answer':
      return <PhoneOff className="h-5 w-5 text-red-500" />;
    case 'voicemail':
      return <Voicemail className="h-5 w-5 text-yellow-500" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};