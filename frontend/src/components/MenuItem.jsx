import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';

const MenuItem = ({ item }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    addToCart(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Generate random rating for demo (in real app, this would come from backend)
  const getRandomRating = () => {
    return (Math.random() * 2 + 3).toFixed(1); // Random rating between 3.0 and 5.0
  };

  const rating = getRandomRating();
  const isPopular = Math.random() > 0.7; // 30% chance to be popular
  const isNew = Math.random() > 0.8; // 20% chance to be new

  return (
    <div
      className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-100 overflow-hidden relative group transform"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {isPopular && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg animate-pulse">
            🔥 Popular
          </div>
        )}
        {isNew && (
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
            ✨ New
          </div>
        )}
      </div>

      {/* Image Section */}
      {item.image && (
        <div className="relative overflow-hidden rounded-xl mb-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Quick Add Button on Hover */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <button
              onClick={handleAddToCart}
              className="bg-white/90 hover:bg-white text-orange-600 font-bold py-2 px-4 rounded-full shadow-lg transform scale-90 hover:scale-100 transition-all duration-200"
            >
              Quick Add
            </button>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300 flex-1">
            {item.name}
          </h3>
          <div className="flex items-center space-x-1 text-sm text-gray-500 ml-2">
            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium">{rating}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-green-600">
              ${item.price}
            </p>
            <span className="text-sm text-gray-400 line-through">
              ${(item.price * 1.2).toFixed(2)}
            </span>
          </div>
          <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
            {item.category}
          </span>
        </div>

        {/* Delivery Time */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>15-25 min</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
            </svg>
            <span>Free delivery</span>
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 transform ${
          isAdded
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-105'
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105'
        }`}
      >
        <span className="flex items-center justify-center space-x-2">
          {isAdded ? (
            <>
              <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">Added to Cart!</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </span>
      </button>

      {/* Hover Effect Overlay */}
      {isHovered && !isAdded && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-red-400/5 rounded-2xl pointer-events-none animate-pulse"></div>
      )}
    </div>
  );
};

export default MenuItem;