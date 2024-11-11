import React, { useState } from 'react';
import { Eye, EyeOff, Lock, DollarSign, CreditCard, Building2, Calendar, TrendingUp, X } from 'lucide-react';
import { paymentsService } from '../../services/payments';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  accountId: string;
  onSubmit: (paymentData: any) => void;
  isPaymentPlan?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  accountId,
  onSubmit,
  isPaymentPlan = false
}) => {
  const [paymentType, setPaymentType] = useState<'card' | 'check'>('card');
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [postDate, setPostDate] = useState('');
  const [paymentData, setPaymentData] = useState({
    card: {
      number: '',
      expiry: '',
      cvv: '',
      name: '',
      zip: ''
    },
    check: {
      routingNumber: '',
      accountNumber: '',
      accountType: 'checking',
      name: ''
    }
  });

  if (!isOpen) return null;

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateSavings = (monthlyAmount: number) => {
    const minPayment = amount / 12;
    let savingsPercent = 0;

    if (monthlyAmount >= amount / 6) { // 6 months or less
      savingsPercent = 0.4; // 40% off
    } else if (monthlyAmount >= amount / 8) { // 8 months or less
      savingsPercent = 0.3; // 30% off
    } else if (monthlyAmount >= amount / 10) { // 10 months or less
      savingsPercent = 0.2; // 20% off
    } else if (monthlyAmount >= minPayment) { // 12 months or less
      savingsPercent = 0.1; // 10% off
    }

    const savings = amount * savingsPercent;
    const newTotal = amount - savings;

    return { savings, newTotal, savingsPercent };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentMethod = paymentType === 'card' ? {
      card: paymentData.card
    } : {
      check: paymentData.check
    };

    let finalAmount = amount;
    let savingsAmount = 0;
    let settlementPercentage = 0;
    let planType = 'settlement';
    let totalPayments = 1;

    if (isPaymentPlan && monthlyPayment) {
      const { savings, newTotal, savingsPercent } = calculateSavings(parseFloat(monthlyPayment));
      finalAmount = newTotal;
      savingsAmount = savings;
      settlementPercentage = savingsPercent * 100;
      planType = 'payment_plan';
      totalPayments = Math.ceil(newTotal / parseFloat(monthlyPayment));
    }

    const payment = {
      account_id: accountId,
      amount: finalAmount,
      payment_type: paymentType,
      payment_method: paymentMethod,
      post_date: postDate ? new Date(postDate).toISOString() : undefined,
      payment_plan_type: planType,
      monthly_payment: isPaymentPlan ? parseFloat(monthlyPayment) : undefined,
      total_payments: totalPayments,
      savings_amount: savingsAmount,
      original_balance: amount,
      settlement_percentage: settlementPercentage
    };

    try {
      const success = await paymentsService.addPayment(payment);
      if (success) {
        onSubmit(payment);
        alert('The details of your arrangement will be sent via email shortly. Please reply or click chat on our website if you have any questions.');
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {isPaymentPlan ? 'Set Up Payment Plan' : 'Make Payment'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentType('card')}
              className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-colors ${
                paymentType === 'card'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('check')}
              className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-colors ${
                paymentType === 'check'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <Building2 className="h-5 w-5 mr-2" />
              Check
            </button>
          </div>

          {/* Monthly Payment Input for Payment Plans */}
          {isPaymentPlan && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Payment Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Minimum: $${formatCurrency(amount / 12)}`}
                  min={amount / 12}
                  step="0.01"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Minimum payment: ${formatCurrency(amount / 12)}/month for 12 months
              </p>

              {monthlyPayment && parseFloat(monthlyPayment) >= amount / 12 && (
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center text-blue-700 mb-2">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    <span className="font-medium">
                      {parseFloat(monthlyPayment) >= amount / 6
                        ? "Maximum Savings Unlocked! 🎉"
                        : parseFloat(monthlyPayment) >= amount / 8
                        ? "Great savings! Can you go higher?"
                        : parseFloat(monthlyPayment) >= amount / 10
                        ? "Good start! Increase for more savings"
                        : "You've unlocked basic savings!"}
                    </span>
                  </div>
                  
                  {parseFloat(monthlyPayment) >= amount / 12 && (
                    <>
                      <div className="text-green-600 font-medium">
                        You'll save ${formatCurrency(calculateSavings(parseFloat(monthlyPayment)).savings)}!
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        New total balance: ${formatCurrency(calculateSavings(parseFloat(monthlyPayment)).newTotal)}
                      </div>
                      {parseFloat(monthlyPayment) < amount / 6 && (
                        <div className="mt-2 text-sm text-blue-600">
                          💡 Tip: Increase your payment to ${formatCurrency(amount / 6)} to unlock maximum 40% savings!
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Post Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={postDate}
                onChange={(e) => setPostDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {paymentType === 'card' ? (
            <>
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showCardNumber ? "text" : "password"}
                    value={paymentData.card.number}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      card: {
                        ...paymentData.card,
                        number: e.target.value.replace(/\D/g, '').slice(0, 16)
                      }
                    })}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="•••• •••• •••• ••••"
                    maxLength={16}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCardNumber ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry
                  </label>
                  <input
                    type="text"
                    value={paymentData.card.expiry}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        const month = value.slice(0, 2);
                        const year = value.slice(2);
                        const formatted = month + (year.length ? '/' + year : '');
                        setPaymentData({
                          ...paymentData,
                          card: {
                            ...paymentData.card,
                            expiry: formatted
                          }
                        });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={paymentData.card.cvv}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      card: {
                        ...paymentData.card,
                        cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="•••"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              {/* Name and ZIP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    value={paymentData.card.name}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      card: {
                        ...paymentData.card,
                        name: e.target.value
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={paymentData.card.zip}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      card: {
                        ...paymentData.card,
                        zip: e.target.value.replace(/\D/g, '').slice(0, 5)
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12345"
                    maxLength={5}
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Routing Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={paymentData.check.routingNumber}
                  onChange={(e) => setPaymentData({
                    ...paymentData,
                    check: {
                      ...paymentData.check,
                      routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9)
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456789"
                  maxLength={9}
                  required
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <div className="relative">
                  <input
                    type={showAccountNumber ? "text" : "password"}
                    value={paymentData.check.accountNumber}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      check: {
                        ...paymentData.check,
                        accountNumber: e.target.value.replace(/\D/g, '')
                      }
                    })}
                    className="w-full pr-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showAccountNumber ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Account Type and Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    value={paymentData.check.accountType}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      check: {
                        ...paymentData.check,
                        accountType: e.target.value as 'checking' | 'savings'
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name on Account
                  </label>
                  <input
                    type="text"
                    value={paymentData.check.name}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      check: {
                        ...paymentData.check,
                        name: e.target.value
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Smith"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Lock className="h-5 w-5 mr-2" />
            {isPaymentPlan 
              ? `Set Up ${monthlyPayment ? `$${formatCurrency(parseFloat(monthlyPayment))}/month` : 'Payment Plan'}`
              : `Pay $${formatCurrency(amount)}`
            }
          </button>

          {/* Security Note */}
          <p className="text-center text-sm text-gray-500">
            Your payment information is encrypted and secure
          </p>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;