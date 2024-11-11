import React, { useState } from 'react';
import { ArrowRight, Check, AlertCircle, Phone, Lock, Shield, FileCheck, LockKeyhole, Bot, DollarSign, ChevronDown, ChevronUp, Clock, CreditCard, TrendingUp } from 'lucide-react';
import PaymentModal from '../../components/payments/PaymentModal';
import { paymentsService } from '../../services/payments';

interface AccountViewProps {
  isDemo?: boolean;
  accountData?: any;
}

const AccountView: React.FC<AccountViewProps> = ({ isDemo = false, accountData }) => {
  const [selectedFaq, setSelectedFaq] = useState<string | null>(null);
  const [showCustomSlider, setShowCustomSlider] = useState(false);
  const [customAmount, setCustomAmount] = useState(978);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isPaymentPlan, setIsPaymentPlan] = useState(false);

  if (!accountData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="text-red-500">Account data not found</div>
      </div>
    );
  }

  const paymentOptions = [
    {
      type: 'settlement',
      savings: '40%',
      amount: accountData ? accountData.current_balance * 0.6 : 0,
      description: 'One-Time Settlement',
      features: [
        'Easy one-time settlement',
        'Need time? Post date your payment!',
        'Clear debt from credit for good',
        'Immediate Paid In Full Letter Sent'
      ]
    },
    {
      type: 'payment-plan',
      savings: '10% - 40%',
      amount: accountData ? accountData.current_balance : 0,
      description: 'Partial Payment Plan',
      features: [
        'Choose option that works for you',
        'Need time? Post date your payment!',
        'Clear debt from credit for good',
        'Paid In Full Letter when complete'
      ]
    }
  ];

  const faqs = [
    {
      id: 'calls',
      question: 'How do I know I won\'t get a call from another agency after settling or making a payment?',
      answer: 'Once you settle or establish a payment plan, we will provide written confirmation. This account will be marked as resolved in our system and no other agencies will contact you about this debt.'
    },
    {
      id: 'statute',
      question: 'Is my account past the statute of limitations?',
      answer: 'The statute of limitations varies by state and type of debt. We recommend consulting with a financial advisor or legal counsel to understand your specific situation.'
    },
    {
      id: 'documentation',
      question: 'Will I receive proof of my payment arrangement?',
      answer: 'Yes! We\'ll email you immediate confirmation and a Paid in Full letter upon completion.'
    },
    {
      id: 'reporting',
      question: 'Will you report my account to the credit bureau or a law firm?',
      answer: 'We are required to report accurate information to credit bureaus. Settling your account or maintaining a payment plan will be reported positively.'
    }
  ];

  const handleMakePayment = (amount: number, isPaymentPlan: boolean = false) => {
    setSelectedAmount(amount);
    setIsPaymentPlan(isPaymentPlan);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      await paymentsService.createPayment(accountData.id, paymentData);
      setShowPaymentModal(false);
      setPaymentSuccess(true);
      alert('The details of your arrangement will be sent via email shortly. Please reply or click chat on our website if you have any questions.');
    } catch (error) {
      console.error('Payment failed:', error);
      setError('Failed to process payment. Please try again.');
    }
  };

  const handleResolveNow = () => {
    const settlementOption = document.querySelector('[data-payment-type="settlement"]');
    if (settlementOption) {
      settlementOption.scrollIntoView({ behavior: 'smooth' });
      handleMakePayment(accountData?.current_balance * 0.6 || 0, false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 shadow-xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Resolve Your Account Today
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Take advantage of our limited-time settlement offer
            </p>
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-blue-100">
              <Clock className="h-5 w-5" />
              <span>Offer expires in 48 hours</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-16">
        {/* Account Summary Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 mb-8 transform hover:scale-[1.02] transition-transform">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 rounded-lg p-2">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Account Summary</h2>
              </div>
              <div className="text-5xl font-bold text-blue-600 mb-4 animate-fade-in">
                ${accountData?.current_balance?.toLocaleString() || '0.00'}
              </div>
              <div className="text-gray-600">
                Original Creditor: <span className="font-medium">{accountData?.original_creditor || 'N/A'}</span>
              </div>
            </div>
            <div className="flex flex-col justify-center items-start md:items-end space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 w-full md:w-auto">
                <div className="flex items-center space-x-2 text-green-700 font-bold mb-1">
                  <TrendingUp className="h-5 w-5" />
                  <span>Limited Time Offer</span>
                </div>
                <div className="text-green-800">Save up to 40% with settlement</div>
              </div>
              <button
                onClick={handleResolveNow}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-8 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg w-full md:w-auto flex items-center justify-center group"
              >
                Resolve Now
                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Shield, text: "Bank-Level Security" },
            { icon: Lock, text: "256-bit Encryption" },
            { icon: FileCheck, text: "Instant Documentation" },
            { icon: Phone, text: "24/7 Support" }
          ].map((item, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center space-x-2 text-white">
              <item.icon className="h-5 w-5 text-blue-400" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Payment Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {paymentOptions.map((option) => (
            <div 
              key={option.type}
              data-payment-type={option.type}
              className="bg-white rounded-xl p-6 shadow-xl border border-gray-200 hover:border-blue-500 transition-all transform hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{option.description}</h3>
                  <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Save {option.savings}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {option.type === 'payment-plan' ? 'Total Balance' : 'Settlement Amount'}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">${option.amount.toLocaleString()}</div>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="bg-green-100 rounded-full p-1 mr-3">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleMakePayment(option.amount, option.type === 'payment-plan')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
              >
                {option.type === 'payment-plan' ? (
                  <>
                    <Clock className="h-5 w-5 mr-2" />
                    Set Up Payment Plan
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Make Payment
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 shadow-xl mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Why Resolve Your Account Today?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <DollarSign className="h-8 w-8 text-blue-300 mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">Save Money</h4>
              <p className="text-blue-100">Take advantage of our settlement offer and save up to 40% on your balance</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Shield className="h-8 w-8 text-blue-300 mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">Improve Credit</h4>
              <p className="text-blue-100">Resolution will be reported to credit bureaus, helping your credit score recover</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Phone className="h-8 w-8 text-blue-300 mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">Stop Collection Calls</h4>
              <p className="text-blue-100">End collection attempts and get peace of mind knowing your debt is resolved</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => setSelectedFaq(selectedFaq === faq.id ? null : faq.id)}
                  className="w-full flex justify-between items-center text-left group"
                >
                  <span className="text-gray-900 font-medium group-hover:text-blue-600">{faq.question}</span>
                  {selectedFaq === faq.id ? (
                    <ChevronUp className="h-5 w-5 text-blue-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                  )}
                </button>
                {selectedFaq === faq.id && (
                  <p className="mt-2 text-gray-600 animate-fadeIn">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">Need assistance? Contact our support team</p>
          <a href="tel:(800)555-0123" className="text-blue-400 font-medium hover:text-blue-300 flex items-center justify-center mt-2">
            <Phone className="h-5 w-5 mr-2" />
            (800) 555-0123
          </a>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={selectedAmount}
          accountId={accountData.id}
          onSubmit={handlePaymentSubmit}
          isPaymentPlan={isPaymentPlan}
        />
      )}
    </div>
  );
};

export default AccountView;