import React, { useState } from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  Users,
  Database,
  Globe,
  Phone,
  TrendingUp,
  LineChart,
  Network,
  Shield,
  PhoneCall
} from 'lucide-react';

import Overview from './Overview';
import AccountsPage from './AccountsPage';
import PaymentsPage from './PaymentsPage';
import SettingsPage from './SettingsPage';
import UploadAccounts from './UploadAccounts';
import RecentCalls from './RecentCalls';
import ROIAnalytics from './ROIAnalytics';
import UsersPage from './UsersPage';
import IntegrationsPage from './IntegrationsPage';
import ConsumerSiteSettings from './ConsumerSiteSettings';
import FlowDesigner from './FlowDesigner';
import CallSettings from './CallSettings';

interface DashboardLayoutProps {
  onLogout: () => void;
  isAdmin?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onLogout, isAdmin = false }) => {
  const navigate = useNavigate();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900">
      <div className={`fixed top-0 left-0 h-full bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 transition-all duration-300 ${
        isMenuCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-6 flex items-center justify-between">
          {!isMenuCollapsed && (
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                <div className="mr-2 bg-blue-500 rounded-lg p-1.5">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  ClearPay<span className="text-blue-500 font-semibold italic">247</span>
                </h1>
              </div>
            </Link>
          )}
          <button
            onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
            className={`text-gray-400 hover:text-white transition-transform duration-300 ${
              isMenuCollapsed ? 'rotate-180' : ''
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              {!isMenuCollapsed && <span>Overview</span>}
            </Link>
            <Link
              to="/dashboard/accounts"
              className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <Database className="h-5 w-5 mr-3" />
              {!isMenuCollapsed && <span>Accounts</span>}
            </Link>
            <Link
              to="/dashboard/upload"
              className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <Upload className="h-5 w-5 mr-3" />
              {!isMenuCollapsed && <span>Upload Accounts</span>}
            </Link>
            <Link
              to="/dashboard/calls"
              className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <Phone className="h-5 w-5 mr-3" />
              {!isMenuCollapsed && <span>Recent Calls</span>}
            </Link>
            <Link
              to="/dashboard/payments"
              className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <CreditCard className="h-5 w-5 mr-3" />
              {!isMenuCollapsed && <span>Payments</span>}
            </Link>
            <Link
              to="/dashboard/analytics"
              className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <TrendingUp className="h-5 w-5 mr-3" />
              {!isMenuCollapsed && <span>ROI Analytics</span>}
            </Link>
            <Link
              to="/dashboard/flows"
              className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <Network className="h-5 w-5 mr-3" />
              {!isMenuCollapsed && <span>Flow Designer</span>}
            </Link>
            <Link
              to="/dashboard/call-settings"
              className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors pl-8"
            >
              <PhoneCall className="h-5 w-5 mr-3" />
              {!isMenuCollapsed && <span>Call Settings</span>}
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/dashboard/users"
                  className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <Users className="h-5 w-5 mr-3" />
                  {!isMenuCollapsed && <span>Users</span>}
                </Link>
                <Link
                  to="/dashboard/integrations"
                  className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <Globe className="h-5 w-5 mr-3" />
                  {!isMenuCollapsed && <span>Integrations</span>}
                </Link>
                <Link
                  to="/dashboard/consumer-site"
                  className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  {!isMenuCollapsed && <span>Consumer Site</span>}
                </Link>
              </>
            )}
            <Link
              to="/dashboard/settings"
              className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5 mr-3" />
              {!isMenuCollapsed && <span>Settings</span>}
            </Link>
          </div>

          <div className="absolute bottom-4 left-0 right-0 px-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              {!isMenuCollapsed && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </div>

      <div className={`transition-all duration-300 ${isMenuCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/upload" element={<UploadAccounts />} />
            <Route path="/calls" element={<RecentCalls />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/analytics" element={<ROIAnalytics />} />
            <Route path="/flows" element={<FlowDesigner />} />
            <Route path="/call-settings" element={<CallSettings />} />
            <Route path="/settings" element={<SettingsPage />} />
            {isAdmin && (
              <>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/consumer-site" element={<ConsumerSiteSettings />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;