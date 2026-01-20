import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import Menu from "../components/Menu";
import Cart from "../components/Cart";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const socket = io("http://localhost:5000");

const Home = () => {
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    socket.on("orderCompleted", data => {
      alert(data.message);
      new Audio("/alarm.mp3").play();
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 shadow-lg py-4 lg:py-6 fixed top-0 left-0 right-0 z-50 overflow-hidden navbar-backdrop">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-3">
            <div className="text-4xl animate-bounce">🍕</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">FoodieHub</h1>
          </div>
          <div className="md:hidden ml-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
              <div className="w-6 h-6 flex flex-col justify-center">
                <span className={`bg-white h-0.5 w-full mb-1 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`bg-white h-0.5 w-full mb-1 transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`bg-white h-0.5 w-full transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {/* Public Order Tracking - Available to everyone */}
            <Link
              to="/public-tracking"
              className="bg-white hover:bg-gray-100 text-purple-600 font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              📊 Live Tracking
            </Link>
            {/* Track Order - Available to everyone */}
            <Link
              to="/track-order"
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              📦 Track Order
            </Link>
            {user ? (
              <>
                <span className="text-white font-medium">Welcome, {user.name}!</span>
                <button
                  onClick={logout}
                  className="bg-white hover:bg-gray-100 text-red-500 font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                  <svg width="50px" height="35px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M2 6.5C2 4.01472 4.01472 2 6.5 2H12C14.2091 2 16 3.79086 16 6V7C16 7.55228 15.5523 8 15 8C14.4477 8 14 7.55228 14 7V6C14 4.89543 13.1046 4 12 4H6.5C5.11929 4 4 5.11929 4 6.5V17.5C4 18.8807 5.11929 20 6.5 20H12C13.1046 20 14 19.1046 14 18V17C14 16.4477 14.4477 16 15 16C15.5523 16 16 16.4477 16 17V18C16 20.2091 14.2091 22 12 22H6.5C4.01472 22 2 19.9853 2 17.5V6.5ZM18.2929 8.29289C18.6834 7.90237 19.3166 7.90237 19.7071 8.29289L22.7071 11.2929C23.0976 11.6834 23.0976 12.3166 22.7071 12.7071L19.7071 15.7071C19.3166 16.0976 18.6834 16.0976 18.2929 15.7071C17.9024 15.3166 17.9024 14.6834 18.2929 14.2929L19.5858 13L11 13C10.4477 13 10 12.5523 10 12C10 11.4477 10.4477 11 11 11L19.5858 11L18.2929 9.70711C17.9024 9.31658 17.9024 8.68342 18.2929 8.29289Z" fill="#0F1729"/>
</svg>
                </button>
                <Link
                  to="/scratch-cards"
                  className="bg-white hover:bg-gray-100 text-purple-600 font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                  🎁 Gift Box
                </Link>
                <Link
                  to="/orders"
                  className="bg-white hover:bg-gray-100 text-green-600 font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                  📋 My Orders
                </Link>
              </>
            ) : null}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-white hover:bg-gray-100 text-orange-500 font-bold py-2 px-4 rounded transition-colors duration-200 flex items-center"
            >
              🛒 Cart
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <div className="bg-white shadow-md py-4 md:hidden fixed top-[72px] lg:top-[88px] left-0 right-0 z-40">
          <div className="container mx-auto px-4">
            <Link
              to="/public-tracking"
              className="block w-full text-left bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded mb-2 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              📊 Live Tracking
            </Link>
            <Link
              to="/track-order"
              className="block w-full text-left bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-2 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              📦 Track Order
            </Link>
            {user && (
              <>
                <button
                  onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }}
                  className="block w-full text-left bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded mb-2 transition-colors duration-200 flex items-center"
                >
                  🛒 Cart
                  {getTotalItems() > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
                <Link
                  to="/scratch-cards"
                  className="block w-full text-left bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded mb-2 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🎁 Gift Box
                </Link>
                <Link
                  to="/orders"
                  className="block w-full text-left bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-2 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📋 My Orders
                </Link>
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="block w-full text-left bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                  🚪 Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {!user && (
        <section className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 text-white min-h-screen flex items-center justify-center py-16 lg:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full opacity-10 animate-bounce"></div>
          <div className="container mx-auto px-4 text-center relative z-10 max-w-6xl">
            <div className="flex justify-center space-x-2 sm:space-x-4 mb-8 lg:mb-12">
              <div className="text-4xl sm:text-6xl lg:text-7xl animate-bounce">🍕</div>
              <div className="text-4xl sm:text-6xl lg:text-7xl animate-pulse">🍔</div>
              <div className="text-4xl sm:text-6xl lg:text-7xl animate-bounce delay-100">🌮</div>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 lg:mb-8 animate-fade-in drop-shadow-lg leading-tight">
              Welcome to <span className="text-yellow-300">FoodieHub</span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 lg:mb-12 animate-fade-in max-w-4xl mx-auto leading-relaxed px-4">
              Discover mouthwatering dishes crafted with love. Fast delivery, fresh ingredients, and unforgettable flavors await!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-8 animate-fade-in px-4">
              <Link
                to="/login"
                className="bg-white text-orange-600 hover:bg-yellow-50 font-bold py-3 sm:py-4 px-6 sm:px-8 lg:px-10 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-orange-500/30 flex items-center justify-center space-x-2 text-sm sm:text-base lg:text-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 sm:border-3 border-white text-white hover:bg-white hover:text-orange-600 font-bold py-3 sm:py-4 px-6 sm:px-8 lg:px-10 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-white/30 flex items-center justify-center space-x-2 text-sm sm:text-base lg:text-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100 2h1z" />
                </svg>
                <span>Register</span>
              </Link>
              <Link
                to="/public-tracking"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 lg:px-10 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-purple-500/30 flex items-center justify-center space-x-2 text-sm sm:text-base lg:text-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span>Live Tracking</span>
              </Link>
              <Link
                to="/track-order"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 lg:px-10 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-blue-500/30 flex items-center justify-center space-x-2 text-sm sm:text-base lg:text-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span>Track Order</span>
              </Link>
            </div>
            <div className="mt-8 sm:mt-12 lg:mt-16 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-sm sm:text-base opacity-80 px-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl">🚚</span>
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl">⭐</span>
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl">💳</span>
                <span>Easy Payment</span>
              </div>
            </div>
          </div>
        </section>
      )}
      <main className="container mx-auto px-4 py-8 pt-20 lg:pt-24">
        <Menu />
      </main>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsCartOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
            <Cart />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;