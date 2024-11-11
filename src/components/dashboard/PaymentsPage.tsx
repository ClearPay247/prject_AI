// ... previous imports

const PaymentsPage: React.FC = () => {
  // ... previous state and functions

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Payments</h2>
      </div>

      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Account</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Payment Method</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Date</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="text-white">{payment.accounts?.account_number}</div>
                    <div className="text-sm text-gray-400">
                      {payment.accounts?.debtor_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">${payment.amount.toFixed(2)}</div>
                    {payment.payment_plan_type === 'payment_plan' && (
                      <div className="text-sm text-gray-400">
                        ${payment.monthly_payment}/month
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize
                      ${payment.payment_plan_type === 'payment_plan' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}
                    >
                      {payment.payment_plan_type || 'One-time'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize
                        ${payment.payment_type === 'card' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}
                      >
                        {payment.payment_type}
                      </span>
                      <button
                        onClick={() => togglePaymentDetails(payment.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {formatPaymentMethod(payment)}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      payment.status === 'processed' ? 'bg-green-500/10 text-green-500' :
                      payment.status === 'declined' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {format(new Date(payment.created_at), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.status === 'pending' && (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(payment.id, 'processed')}
                          className="p-1 hover:bg-green-500/10 rounded-lg text-green-500"
                          title="Mark as Processed"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(payment.id, 'declined')}
                          className="p-1 hover:bg-red-500/10 rounded-lg text-red-500"
                          title="Mark as Declined"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsPage;