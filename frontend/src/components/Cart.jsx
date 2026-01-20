import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
  const { user } = useAuth();

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 m-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4 mb-4">
            {cartItems.map(item => (
              <div key={item._id} className="flex justify-between items-center border-b pb-2">
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-gray-600 ml-2">- ${item.price} x {item.quantity}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-3 rounded text-lg"
                  >
                    -
                  </button>
                  <span className="font-semibold mx-2">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-3 rounded text-lg"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Total: ${getTotal()}</h3>
            <Link
              to="/checkout"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded block text-center transition-colors duration-200"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;