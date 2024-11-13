import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bot, 
  Shield, 
  Upload, 
  Database, 
  Clock, 
  Zap,
  ArrowRight,
  FileUp,
  RefreshCcw,
  Workflow,
  Calendar,
  CheckCircle2,
  Phone,
  MessageSquare,
  Lock,
  FileCheck,
  LockKeyhole,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';
import CollectorCard from '../components/CollectorCard';
import AuthModal from '../components/AuthModal';
import IndustriesSection from '../components/IndustriesSection';
import TestDriveSection from '../components/TestDriveSection';
import { collectors } from '../data/collectors';
import { Collector } from '../types/collector';

interface HomePageProps {
  onAuth: (email: string, password: string, rememberMe: boolean) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onAuth }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);
  const navigate = useNavigate();

  const integrationFeatures = [
    {
      icon: FileUp,
      title: "Manual Upload",
      description: "Easily upload accounts via CSV or Excel files",
      color: "from-blue-500/10 to-blue-600/10"
    },
    {
      icon: Database,
      title: "Batch Processing",
      description: "Process thousands of accounts simultaneously",
      color: "from-purple-500/10 to-purple-600/10"
    },
    {
      icon: RefreshCcw,
      title: "CRM Integration",
      description: "Direct integration with your existing CRM",
      color: "from-green-500/10 to-green-600/10"
    },
    {
      icon: Calendar,
      title: "Automated Triggers",
      description: "Start collections based on aging thresholds",
      color: "from-yellow-500/10 to-yellow-600/10"
    }
  ];

  const benefitsList = [
    {
      icon: Clock,
      text: "24/7 Automated Collections",
      color: "text-blue-400"
    },
    {
      icon: Shield,
      text: "FDCPA & TCPA Compliant",
      color: "text-green-400"
    },
    {
      icon: TrendingUp,
      text: "No Commission Fees",
      color: "text-purple-400"
    },
    {
      icon: Zap,
      text: "Instant Account Setup",
      color: "text-yellow-400"
    }
  ];

  const handleHire = (collector: Collector) => {
    setSelectedCollector(collector);
    setShowAuthModal(true);
  };

  const handleHireAll = () => {
    setSelectedCollector(null);
    setShowAuthModal(true);
  };

  const handleAuth = (email: string, password: string, rememberMe: boolean) => {
    onAuth(email, password, rememberMe);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900">
      {/* Trust Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                <div className="mr-2 bg-blue-500 rounded-lg p-1.5">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  ClearPay<span className="text-blue-500 font-semibold italic">247</span>
                </h1>
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-300">
                <Shield className="h-4 w-4 text-green-500 mr-1" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <LockKeyhole className="h-4 w-4 text-blue-500 mr-1" />
                <span>256-bit Encryption</span>
              </div>
              <Link 
                to="/creditor"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                For Businesses
              </Link>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
              >
                Sign Up / Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-gradient"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                Automate Your Accounts<br />Receivable Recovery
              </h1>
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Turn Overdue Invoices into Collected Revenue - Automatically
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {integrationFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
                  >
                    <div className={`bg-gradient-to-br ${feature.color} rounded-lg p-3 w-12 h-12 mx-auto mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 hover:shadow-lg flex items-center group"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.getElementById('collectors')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Bridge Section */}
        <div className="relative py-16 bg-gradient-to-b from-transparent to-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {benefitsList.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-center text-center transform hover:scale-105 transition-transform"
                >
                  <div className="flex items-center space-x-2">
                    <benefit.icon className={`h-5 w-5 ${benefit.color}`} />
                    <span className="text-gray-300 font-medium">{benefit.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gray-900/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                <Lock className="h-8 w-8 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Bank-Grade Security</h3>
                <p className="text-gray-400">
                  Your data is protected with military-grade encryption and security protocols
                </p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                <Shield className="h-8 w-8 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">100% Compliant</h3>
                <p className="text-gray-400">
                  Fully compliant with FDCPA, TCPA, and other regulatory requirements
                </p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                <Users className="h-8 w-8 text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Expert Support</h3>
                <p className="text-gray-400">
                  24/7 access to our dedicated support team and knowledge base
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Collectors Section */}
        <div id="collectors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              FDCPA & TCPA Compliant A<span className="text-blue-500">i</span> Collectors
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Attorney-vetted, A<span className="text-blue-500">i</span>-powered virtual collectors work 24/7, maintain perfect compliance,
              and help maximize your recovery rates at a fraction of traditional costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collectors.map((collector) => (
              <CollectorCard
                key={collector.id}
                collector={collector}
                onHire={handleHire}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={handleHireAll}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 hover:shadow-lg"
            >
              Hire All Collectors
            </button>
            <p className="text-gray-400 mt-2">
              Get the full team working for maximum efficiency
            </p>
          </div>
        </div>

        <TestDriveSection />
        <IndustriesSection />

        {/* Security Badges */}
        <div className="bg-gray-900/50 py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center">
              <p className="text-gray-400 mb-6">Protected By</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-center">
                    <Shield className="h-8 w-8 text-blue-500 mr-2" />
                    <span className="text-lg font-bold text-white">PCI DSS Compliant</span>
                  </div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-center">
                    <Lock className="h-8 w-8 text-green-500 mr-2" />
                    <span className="text-lg font-bold text-white">256-bit SSL</span>
                  </div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-center">
                    <FileCheck className="h-8 w-8 text-purple-500 mr-2" />
                    <span className="text-lg font-bold text-white">SOC 2 Type II</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">About ClearPay247</h3>
              <p className="text-sm">
                Secure, reliable payment solutions for managing your accounts.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <p className="text-sm">
                Support available 24/7<br />
                1-800-555-0123
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="text-sm space-y-2">
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} ClearPay247. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSubmit={handleAuth}
      />
    </div>
  );
};

export default HomePage;