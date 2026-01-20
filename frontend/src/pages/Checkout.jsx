import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Bill from '../components/Bill';
import EmailNotification from '../components/EmailNotification';

const Checkout = () => {
  const { cartItems, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [showEmailNotification, setShowEmailNotification] = useState(false);

  const discount = user?.discount || 0;
  const subtotal = getTotal();
  const discountedTotal = Math.max(subtotal - discount, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({ menuId: item._id, quantity: item.quantity })),
        total: discountedTotal,
        paymentMethod
      };
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });
      console.log('Order response status:', response.status);
      console.log('Order response ok:', response.ok);
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
          console.log('Order error response:', errorText);
        } catch (e) {
          errorText = `HTTP ${response.status}: ${response.statusText}`;
          console.log('Order error response (raw):', errorText);
        }
        throw new Error(`Failed to place order: ${errorText}`);
      }
      const order = await response.json();

      // Process payment
      const paymentResponse = await fetch(`http://localhost:5000/api/payments/${order._id}/process`, {
        method: 'POST'
      });
      if (!paymentResponse.ok) throw new Error('Payment failed');
      await paymentResponse.json();

      clearCart();
      setOrderPlaced(order);
      setShowEmailNotification(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to your cart before checking out.</p>
          <a href="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 inline-block">Go back to menu</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-gray-600 ml-2">x {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center text-lg text-gray-700">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-lg text-green-600">
                  <span>Discount:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xl font-bold text-gray-800 mt-2">
                <span>Total:</span>
                <span>${discountedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash on Delivery</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
      {orderPlaced && (
        <Bill order={orderPlaced} onClose={() => { setOrderPlaced(null); }} />
      )}
      {showEmailNotification && orderPlaced && (
        <EmailNotification
          order={orderPlaced}
          onClose={() => {
            setShowEmailNotification(false);
            navigate('/');
          }}
        />
      )}
    </div>
  );
};

export default Checkout;