import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import ConsumerPortal from './pages/consumer/ConsumerPortal';
import ChatWidget from './components/chat/ChatWidget';
import { AuthData } from './types/auth';
import { initializeDatabase } from './lib/database';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [authData, setAuthData] = useState<AuthData>(() => {
    const saved = localStorage.getItem('authData');
    return saved ? JSON.parse(saved) : { isLoggedIn: false };
  });

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
    };

    init();
  }, []);

  const handleAuth = async (email: string, password: string, rememberMe: boolean) => {
    try {
      // Handle hardcoded admin login
      if (email === 'admin@clearpay247.com' && password === 'CP247@dm1n2024!') {
        const newAuthData: AuthData =  {
          isLoggedIn: true,
          email,
          role: "site_admin",
          userId: "admin",
          rememberMe
        };
        setAuthData(newAuthData);
        if (rememberMe) {
          localStorage.setItem('authData', JSON.stringify(newAuthData));
        }
        return;
      }

      // Handle CRM admin login
      if (email === 'crm@clearpay247.com' && password === 'CP247crm@2024!') {
        const newAuthData: AuthData = {
          isLoggedIn: true,
          email,
          role: 'crm_admin',
          userId: 'crm_admin',
          rememberMe
        };
        setAuthData(newAuthData);
        if (rememberMe) {
          localStorage.setItem('authData', JSON.stringify(newAuthData));
        }
        return;
      }

      // For now, throw error for other logins
      throw new Error('Invalid login credentials');

    } catch (err) {
      console.error('Authentication error:', err);
      throw new Error('Invalid login credentials');
    }
  };

  const handleLogout = () => {
    setAuthData({ isLoggedIn: false });
    localStorage.removeItem('authData');
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/creditor" element={<HomePage onAuth={handleAuth} />} />

        <Route path="/consumer/verify" element={<ConsumerPortal />} />
        <Route path="/consumer/demo" element={<ConsumerPortal isDemo={true} />} />
        <Route path="/consumer/*" element={<ConsumerPortal />} />

        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            authData.isLoggedIn ? (
              <DashboardLayout 
                onLogout={handleLogout} 
                isAdmin={authData.role === 'site_admin'}
                userRole={authData.role}
                userEmail={authData.email}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Chat Widget - Available on all pages */}
      <ChatWidget />
    </>
  );
};

export default App;