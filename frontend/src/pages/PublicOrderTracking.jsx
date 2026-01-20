import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';

const PublicOrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Connect to Socket.IO
  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    // Join public order tracking room
    newSocket.emit('joinPublicOrderTracking');

    // Handle real-time order updates
    newSocket.on('publicOrderUpdate', (data) => {
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => 
          order._id === data.orderId 
            ? { 
                ...order, 
                status: data.status, 
                estimatedTime: data.estimatedTime,
                isCompleted: data.isCompleted 
              }
            : order
        );
        return updatedOrders;
      });
    });

    // Handle order deletions
    newSocket.on('publicOrderDeleted', (orderId) => {
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders/public`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'approved': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'approved': '✅',
      'completed': '🎉'
    };
    return icons[status] || '❓';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const highlightCompletedOrder = (order) => {
    if (order.isCompleted) {
      return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg transform scale-105';
    }
    return 'bg-white border border-gray-200 hover:shadow-md transition-all duration-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Live Order Tracking</h1>
            <p className="text-gray-600">Track all approved and completed orders in real-time</p>
          </div>
          <Link 
            to="/" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            🏠 Back to Home
          </Link>
        </div>

        {/* Auto-refresh notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">🔄</span>
            <span className="text-blue-700">
              <strong>Live Updates:</strong> This page automatically updates when orders are approved or completed by the admin.
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Orders</h3>
            <p className="text-gray-600">
              There are currently no approved or completed orders to display.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className={`rounded-lg p-6 transition-all duration-300 ${highlightCompletedOrder(order)}`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-800">
                      #{order.orderNumber}
                    </span>
                    {order.isCompleted && (
                      <span className="animate-pulse text-yellow-500 text-xl">✨</span>
                    )}
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    <span className="mr-1">{getStatusIcon(order.status)}</span>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>

                {/* Customer Name - Highlighted for completed orders */}
                <div className="mb-4">
                  <h3 className={`text-lg font-semibold ${order.isCompleted ? 'text-orange-800' : 'text-gray-800'}`}>
                    {order.isCompleted ? '🎉 ' : '👤 '}
                    <span className={order.isCompleted ? 'animate-pulse' : ''}>
                      {order.customerName}
                    </span>
                    {order.isCompleted && ' 🎉'}
                  </h3>
                </div>

                {/* Order Time */}
                <div className="text-sm text-gray-600 mb-4">
                  <strong>Ordered at:</strong> {formatTime(order.createdAt)}
                </div>

                {/* Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{order.items.length - 3} more items...
                      </div>
                    )}
                  </div>
                </div>

                {/* Total and Status */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Total:</span>
                    <span className="font-bold text-lg text-gray-800">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <strong>Status:</strong> {order.estimatedTime}
                  </div>
                </div>

                {/* Special highlight for completed orders */}
                {order.isCompleted && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-300">
                    <div className="text-center">
                      <span className="text-yellow-800 font-bold text-lg animate-bounce">
                        🎊 ORDER COMPLETED! 🎊
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Orders'}
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📋 Order Status Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">✅</span>
              <span><strong>Approved:</strong> Order has been approved by admin and is being prepared</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">🎉</span>
              <span><strong>Completed:</strong> Order is ready and customer's name is highlighted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicOrderTracking;