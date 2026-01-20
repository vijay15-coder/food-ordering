import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// Browser Extension Interference Protection
(function() {
  // Override console.error to filter extension errors
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('translate-page') || message.includes('content-all.js')) {
      console.warn('Browser extension interference detected and suppressed');
      return;
    }
    originalError.apply(console, args);
  };

  // Global error handler for extension interference
  window.addEventListener('error', function(event) {
    if (event.message && (event.message.includes('translate-page') || event.message.includes('content-all.js'))) {
      console.warn('Browser extension interference detected and handled');
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  // Global promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && (event.reason.message.includes('translate-page') || event.reason.message.includes('content-all.js'))) {
      console.warn('Browser extension promise rejection handled');
      event.preventDefault();
      return false;
    }
  });

  // Add unique IDs that extensions might look for
  document.addEventListener('DOMContentLoaded', function() {
    // Create elements that translation extensions commonly look for
    if (!document.getElementById('translate-page')) {
      const translateDiv = document.createElement('div');
      translateDiv.id = 'translate-page';
      translateDiv.style.display = 'none';
      document.body.appendChild(translateDiv);
    }
  });
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AuthProvider>
);
