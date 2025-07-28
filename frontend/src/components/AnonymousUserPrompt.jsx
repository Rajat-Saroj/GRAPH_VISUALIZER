// components/AnonymousUserPrompt.jsx
import React from 'react';

function AnonymousUserPrompt({ 
  show, 
  onClose, 
  onSignup, 
  title = "Sign Up to Unlock More Features",
  message = "Create an account to save your work and access advanced features."
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚀</span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
                         text-gray-700 hover:bg-gray-50 font-medium"
            >
              Maybe Later
            </button>
            <button
              onClick={onSignup}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                         text-white rounded-lg font-medium"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnonymousUserPrompt;
