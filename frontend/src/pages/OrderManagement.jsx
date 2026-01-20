import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import Bill from '../components/Bill';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    console.log('Fetching orders...');
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'present' : 'missing');
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      console.log('Orders data:', data);
      setOrders(data);
    } catch (err) {
      console.log('Error fetching orders:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = io('http://localhost:5000');
    socket.on('newOrder', (newOrder) => {
      fetchOrders();
      setSelectedOrder(newOrder); // Automatically show bill for new order
    });
    socket.on('orderDeleted', (orderId) => {
      setOrders(prev => prev.filter(order => order._id !== orderId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      await fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <Link to="/admin" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">Back to Dashboard</Link>
        </div>

        <div className="mb-6">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Orders Overview</h2>
              <div className="text-sm text-gray-600">
                Pending Orders: <span className="font-semibold text-gray-800">{orders.filter(order => order.status === 'pending').length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Order #{order.orderNumber || order._id.slice(-6)}</h3>
                    <p className="text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${order.total}</div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Customer Details</h4>
                    <p className="text-gray-600"><span className="font-medium">Name:</span> {order.userId?.name || 'Unknown'}</p>
                    <p className="text-gray-600"><span className="font-medium">Email:</span> {order.userId?.email || 'Unknown'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Order Details</h4>
                    <p className="text-gray-600"><span className="font-medium">Payment:</span> {order.paymentMethod}</p>
                    {order.deliveryAddress && <p className="text-gray-600"><span className="font-medium">Address:</span> {order.deliveryAddress}</p>}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Actions</h4>
                    <div className="flex space-x-2 flex-wrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                      >
                        View Bill
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(order._id, 'approved')}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                        >
                          Accept
                        </button>
                      )}
                      {order.status !== 'completed' && order.status !== 'ready' && (
                        <button
                          onClick={() => handleStatusChange(order._id, 'completed')}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.menuId?._id || item._id} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-800">{item.menuId?.name || 'Unknown Item'}</span>
                            <span className="text-gray-600 ml-2">x {item.quantity}</span>
                          </div>
                          <span className="font-semibold text-gray-800">${((item.menuId?.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {orders.length === 0 && (
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-600">Orders will appear here once customers start placing them.</p>
          </div>
        )}
      </div>
      {selectedOrder && (
        <Bill order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default OrderManagement;