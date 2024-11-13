import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  Phone, 
  Shield, 
  Lock, 
  AlertCircle, 
  Check, 
  CreditCard,
  Clock,
  FileCheck,
  LockKeyhole,
  Bot,
  Star,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhone(formatPhoneNumber(cleaned));
      setError('');
    }
  };

  const handlePhoneSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSearching(true);
    
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      
      if (cleanPhone.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        setSearching(false);
        return;
      }

      const phoneFormats = [
        cleanPhone,
        `1${cleanPhone}`,
        `+1${cleanPhone}`
      ];

      const { data, error } = await supabase
        .from('phone_numbers')
        .select(`
          account_id,
          accounts (
            id,
            account_number,
            debtor_name,
            ssn
          )
        `)
        .or(phoneFormats.map(p => `number.eq.${p}`).join(','));

      if (error) throw error;

      if (data && data.length > 0) {
        // Deduplicate accounts by account_number
        const uniqueAccounts = data.reduce((acc: any[], curr: any) => {
          if (!acc.find(item => item.accounts?.account_number === curr.accounts?.account_number)) {
            acc.push(curr);
          }
          return acc;
        }, []);

        if (uniqueAccounts.length === 1) {
          navigate(`/consumer/verify?phone=${cleanPhone}`);
        } else {
          const accountIds = uniqueAccounts.map(a => a.accounts?.account_number).join(',');
          navigate(`/consumer/verify?phone=${cleanPhone}&accounts=${accountIds}`);
        }
      } else {
        setError('Please enter the phone number you were contacted at.');
      }
    } catch (err) {
      setError('Please enter the phone number you were contacted at.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900">
      {/* Trust Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                <div className="mr-2 bg-blue-500 rounded-lg p-1.5">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  ClearPay<span className="text-blue-500 font-semibold italic">247</span>
                </h1>
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-500 mr-1" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <LockKeyhole className="h-4 w-4 text-blue-500 mr-1" />
                <span>256-bit Encryption</span>
              </div>
              <Link 
                to="/creditor"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                For Businesses
              </Link>
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
            <div className="light-streak"></div>
            <div className="light-streak"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                Simple, Secure Bill Resolution
              </h1>
              <p className="text-xl text-gray-300 mb-12">
                Take control of your finances with flexible payment options and 24/7 account access
              </p>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto border border-gray-700/50 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Access Your Account
                </h2>
                <form onSubmit={handlePhoneSearch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900/50 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-inner"
                        placeholder="(555) 555-5555"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={searching}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
                  >
                    {searching ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </span>
                    ) : (
                      <>
                        <Phone className="h-5 w-5 mr-2" />
                        Access Account
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                Why Choose ClearPay247?
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                We make managing your payments simple, secure, and stress-free
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Safe & Secure",
                  description: "Bank-level security protects your information"
                },
                {
                  icon: Clock,
                  title: "24/7 Access",
                  description: "Manage your account anytime, anywhere"
                },
                {
                  icon: CreditCard,
                  title: "Flexible Payments",
                  description: "Multiple payment options to fit your budget"
                },
                {
                  icon: FileCheck,
                  title: "Instant Documentation",
                  description: "Get payment confirmations immediately"
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="bg-blue-50 rounded-lg p-3 w-12 h-12 mb-4">
                    <benefit.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-50 rounded-xl p-8">
                <Calendar className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Flexible Payment Plans
                </h3>
                <p className="text-gray-600">
                  Choose a payment schedule that works for your budget
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-8">
                <CheckCircle2 className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Settlement Options
                </h3>
                <p className="text-gray-600">
                  Explore opportunities to resolve your account for less
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-8">
                <Star className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  24/7 Online Access
                </h3>
                <p className="text-gray-600">
                  View your balance and make payments anytime
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                What Our Users Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  text: "Easy to use and helped me get back on track. The payment plans really helped me manage my debt.",
                  author: "Sarah M."
                },
                {
                  text: "I appreciate how secure and straightforward everything is. Makes handling payments much less stressful.",
                  author: "Michael R."
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                  <p className="text-gray-900 font-medium">{testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Badges */}
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center">
              <p className="text-gray-600 mb-6">Protected By</p>
              <div className="flex items-center justify-center space-x-8">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-32 flex items-center justify-center bg-gray-100 rounded-lg">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <span className="ml-2 font-bold text-gray-900">PCI DSS</span>
                  </div>
                  <span className="text-sm text-gray-600 mt-2">PCI Compliant</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-16 w-32 flex items-center justify-center bg-gray-100 rounded-lg">
                    <Lock className="h-8 w-8 text-blue-600" />
                    <span className="ml-2 font-bold text-gray-900">256-bit</span>
                  </div>
                  <span className="text-sm text-gray-600 mt-2">SSL Encryption</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-16 w-32 flex items-center justify-center bg-gray-100 rounded-lg">
                    <FileCheck className="h-8 w-8 text-blue-600" />
                    <span className="ml-2 font-bold text-gray-900">SOC 2</span>
                  </div>
                  <span className="text-sm text-gray-600 mt-2">Type II Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
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
                  <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} ClearPay247. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;