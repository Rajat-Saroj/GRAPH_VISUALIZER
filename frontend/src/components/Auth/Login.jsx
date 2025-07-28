// components/Auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function Login({ onClose, switchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 
                      w-full sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[40%] max-w-md
                      max-h-[95vh] overflow-y-auto shadow-modal">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-primary-600 text-xl sm:text-2xl font-bold">
            Login to Your Account
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-xl sm:text-2xl 
                       p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-primary-300 focus:border-primary-500
                         hover:border-gray-400 transition-colors"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-primary-300 focus:border-primary-500
                         hover:border-gray-400 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold
                         transition-all duration-200 ${
                           loading 
                             ? 'bg-gray-400 cursor-not-allowed' 
                             : 'bg-primary-600 hover:bg-primary-700 transform hover:scale-105'
                         } text-white`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <button
              type="button"
              onClick={switchToSignup}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg 
                         text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
