import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Globe, 
  Network, 
  PhoneCall,
  Bot,
  Settings,
  Mail
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          to="/dashboard/settings/users"
          className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors"
        >
          <Users className="h-8 w-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Users</h3>
          <p className="text-gray-400">Manage user accounts and permissions</p>
        </Link>

        <Link 
          to="/dashboard/settings/integrations"
          className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors"
        >
          <Globe className="h-8 w-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Integrations</h3>
          <p className="text-gray-400">Configure third-party integrations</p>
        </Link>

        <Link 
          to="/dashboard/settings/flow-designer"
          className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors"
        >
          <Network className="h-8 w-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Flow Designer</h3>
          <p className="text-gray-400">Design automated collection workflows</p>
        </Link>

        <Link 
          to="/dashboard/settings/call-settings"
          className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors"
        >
          <PhoneCall className="h-8 w-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Call Settings</h3>
          <p className="text-gray-400">Configure call rules and compliance settings</p>
        </Link>

        <Link 
          to="/dashboard/settings/email-templates"
          className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors"
        >
          <Mail className="h-8 w-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Email Templates</h3>
          <p className="text-gray-400">Manage email templates and notifications</p>
        </Link>

        {/* Only show Smart Import for admin users */}
        <Link 
          to="/dashboard/settings/smartmap"
          className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors"
        >
          <Bot className="h-8 w-8 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Smart Import</h3>
          <p className="text-gray-400">AI-powered account import and mapping</p>
        </Link>
      </div>
    </div>
  );
};

export default SettingsPage;