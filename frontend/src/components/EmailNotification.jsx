import React, { useState, useEffect } from 'react';

const EmailNotification = ({ order, onClose }) => {
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    // Simulate email sending delay
    const timer = setTimeout(() => {
      setShowEmail(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowEmail(false);
    onClose();
  };

  const handleDownloadEmail = () => {
    const emailContent = `
To: ${order.userId?.email}
Subject: Your FoodieHub Order Confirmation - Order #${order.orderNumber || order._id.slice(-6)}

Dear ${order.userId?.name},

Thank you for your order! Your delicious meal is being prepared with love.

ORDER DETAILS:
Order Number: #${order.orderNumber || order._id.slice(-6)}
Order Date: ${new Date(order.createdAt).toLocaleString()}
Total Amount: $${order.total.toFixed(2)}
Payment Method: ${order.paymentMethod}

ITEMS ORDERED:
${order.items.map(item => 
  `• ${item.menuId?.name || 'Unknown Item'} x ${item.quantity} - $${((item.menuId?.price || 0) * item.quantity).toFixed(2)}`
).join('\n')}

ORDER STATUS: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}

We'll notify you when your order is ready for pickup/delivery.

Thank you for choosing FoodieHub! 🍕

Best regards,
The FoodieHub Team
    `.trim();

    const blob = new Blob([emailContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FoodieHub-Order-${order.orderNumber || order._id.slice(-6)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!showEmail) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Sending Order Confirmation</h3>
          <p className="text-gray-600">Please wait while we prepare your bill...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="text-center">
            <div className="text-3xl mb-2">📧</div>
            <h1 className="text-xl font-bold">Order Confirmation Sent!</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600">
              Your order has been placed successfully and a confirmation email has been prepared.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Email Preview:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>To:</strong> {order.userId?.email}</p>
              <p><strong>Subject:</strong> Your FoodieHub Order Confirmation - Order #{order.orderNumber || order._id.slice(-6)}</p>
              <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDownloadEmail}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Download Email Content</span>
            </button>

            <button
              onClick={handleClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotification;