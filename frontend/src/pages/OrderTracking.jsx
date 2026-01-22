import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import API_BASE_URL from '../config/api';

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Connect to Socket.IO
  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Handle Socket.IO events for order updates
  useEffect(() => {
    if (socket && order) {
      socket.emit('joinOrderTracking', order.orderNumber);
      
      socket.on('orderStatusUpdate', (data) => {
        if (data.orderNumber === order.orderNumber) {
          setOrder(prevOrder => ({
            ...prevOrder,
            status: data.status,
            estimatedTime: data.estimatedTime
          }));
        }
      });

      socket.on('orderDeleted', (orderNum) => {
        if (orderNum === order.orderNumber) {
          setOrder(null);
          setError('Order has been completed and removed');
        }
      });

      return () => {
        socket.off('orderStatusUpdate');
        socket.off('orderDeleted');
      };
    }
  }, [socket, order]);

  const trackOrder = async () => {
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/track/${orderNumber}`);
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to fetch order';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${response.status}`;
          }
        } else {
          errorMessage = `Server error: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'ready': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'approved': '✅',
      'preparing': '👨‍🍳',
      'ready': '🔔',
      'completed': '✅'
    };
    return icons[status] || '❓';
  };

  if (order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Order Tracking</h1>
            <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
              Back to Home
            </Link>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
                  <p className="text-blue-100">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">${order.total}</div>
                  <div className="text-blue-100">Total Amount</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Order Status */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Order Status</h3>
                <div className="flex items-center space-x-4">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    <span className="mr-2 text-lg">{getStatusIcon(order.status)}</span>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                  <div className="text-gray-600">
                    <strong>Estimated time:</strong> {order.estimatedTime}
                  </div>
                </div>
              </div>

              {/* Order Progress */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Progress</h3>
                <div className="space-y-4">
                  {[
                    { status: 'pending', label: 'Order Received', icon: '📋' },
                    { status: 'approved', label: 'Order Approved', icon: '✅' },
                    { status: 'preparing', label: 'Preparing Food', icon: '👨‍🍳' },
                    { status: 'ready', label: 'Ready for Pickup', icon: '🔔' },
                    { status: 'completed', label: 'Completed', icon: '✅' }
                  ].map((step, index) => {
                    const isCompleted = ['pending', 'approved', 'preparing', 'ready', 'completed'].indexOf(order.status) >= index;
                    const isCurrent = order.status === step.status;
                    
                    return (
                      <div key={step.status} className={`flex items-center space-x-3 p-3 rounded-lg ${isCompleted ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <div className={`text-2xl ${isCompleted ? 'opacity-100' : 'opacity-30'}`}>
                          {step.icon}
                        </div>
                        <div className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-500'}`}>
                          {step.label}
                        </div>
                        {isCurrent && (
                          <div className="ml-auto">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Order Items</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800">{item.name}</span>
                          <span className="text-gray-600 ml-2">x {item.quantity}</span>
                        </div>
                        <span className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Track Another Order */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setOrder(null);
                    setOrderNumber('');
                    setError(null);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Track Another Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order Tracking</h1>
          <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
            Back to Home
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Track Your Order</h2>
            <p className="text-gray-600">Enter your order number to see the current status</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter your order number (e.g., 32)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={trackOrder}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>💡 <strong>Tip:</strong> Your order number is displayed on your receipt after placing an order</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;