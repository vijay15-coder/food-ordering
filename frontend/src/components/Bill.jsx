import React from 'react';

const Bill = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Create a new window with just the bill content for PDF generation
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Food Order Bill - Order #${order.orderNumber || order._id.slice(-6)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section h3 { margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🍕 FoodieHub</h1>
            <h2>Order Bill</h2>
            <p>Order #${order.orderNumber || order._id.slice(-6)}</p>
            <p>${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <div class="section">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${order.userId?.name || 'Unknown'}</p>
            <p><strong>Email:</strong> ${order.userId?.email || 'Unknown'}</p>
          </div>
          
          <div class="section">
            <h3>Order Items</h3>
            ${order.items.map(item => `
              <div class="item">
                <span>${item.menuId?.name || 'Unknown Item'} x ${item.quantity}</span>
                <span>$${((item.menuId?.price || 0) * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total">
            <div class="item">
              <span>Total Amount:</span>
              <span>$${order.total.toFixed(2)}</span>
            </div>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing FoodieHub!</p>
            <p>For any queries, please contact us.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 scale-100 print:shadow-none print:max-w-none print:w-full print:p-4 print:rounded-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl print:rounded-none">
          <div className="text-center">
            <div className="text-3xl mb-2">🍕</div>
            <h1 className="text-2xl font-bold">FoodieHub</h1>
            <p className="text-orange-100">Order Bill</p>
          </div>
        </div>

        {/* Bill Content */}
        <div className="p-6 print:p-4">
          <div className="text-center mb-6 print:mb-4">
            <h2 className="text-xl font-bold text-gray-800 print:text-lg">
              Order #{order.orderNumber || order._id.slice(-6)}
            </h2>
            <p className="text-gray-600 print:text-sm">{formatDate(order.createdAt)}</p>
          </div>

          <div className="mb-6 print:mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 print:text-base border-b pb-1">Customer Details</h3>
            <div className="space-y-1 print:text-sm">
              <p className="text-gray-700"><span className="font-medium">Name:</span> {order.userId?.name || 'Unknown'}</p>
              <p className="text-gray-700"><span className="font-medium">Email:</span> {order.userId?.email || 'Unknown'}</p>
            </div>
          </div>

          <div className="mb-6 print:mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 print:text-base border-b pb-1">Order Items</h3>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.menuId?._id || item._id} className="flex justify-between items-center print:text-sm">
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{item.menuId?.name || 'Unknown Item'}</span>
                    <span className="text-gray-600 ml-2">x {item.quantity}</span>
                    <div className="text-sm text-gray-500">
                      ${(item.menuId?.price || 0).toFixed(2)} each
                    </div>
                  </div>
                  <span className="font-semibold text-gray-800 ml-4">
                    ${((item.menuId?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-4 print:pt-2">
            <div className="flex justify-between items-center text-xl font-bold text-gray-800 print:text-base mb-2">
              <span>Total Amount:</span>
              <span className="text-green-600">${order.total.toFixed(2)}</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Payment Method:</span> <span className="capitalize">{order.paymentMethod}</span></p>
              <p><span className="font-medium">Order Status:</span> <span className="capitalize">{order.status}</span></p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg print:bg-white">
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium mb-1">Thank you for choosing FoodieHub! 🍽️</p>
              <p>For any queries, please contact our customer service.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            <span>Print Bill</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bill;