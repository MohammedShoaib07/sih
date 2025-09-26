import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { register, signIn } = useAppStore();
  const [activeTab, setActiveTab] = useState<'citizen' | 'government'>('citizen');
  const [isRegister, setIsRegister] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('All fields are required');
      return;
    }

    if (isRegister) {
      // Prevent government account registration
      if (activeTab === 'government') {
        setError('Government account registration is restricted. Please contact your administrator for access.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const success = register(email, password, false); // Always false for citizen registration
      if (success) {
        navigate('/profile-setup');
      } else {
        setError('Email already registered');
      }
    } else {
      const success = signIn(email, password);
      if (success) {
        // Get the updated state after sign in
        const { isGovUser, hasCompletedSetup } = useAppStore.getState();

        // Navigate based on user type and setup status
        if (!hasCompletedSetup) {
          navigate('/profile-setup');
        } else if (isGovUser) {
          navigate('/gov-home');
        } else {
          navigate('/home');
        }
      } else {
        setError('Invalid email or password');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
        <div className="p-6 md:p-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-4 inline-flex items-center text-gray-600 hover:text-blue-600 text-sm"
          >
            ← Back to Home
          </button>
          <div className="w-32 h-32 flex items-center justify-center mx-auto mb-6 bg-gray-50 rounded-2xl">
            <img
              src="/logo2.jpg"
              alt="FixMyPothole.AI Logo"
              className="w-28 h-28 object-contain drop-shadow"
            />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FixMyPothole.AI</h1>
            <p className="text-sm text-gray-600">AI Powered Pothole Detecting & Reporting System</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-8 bg-gray-100 rounded-xl p-1">
            <button
              className={`py-3 text-center rounded-lg font-medium transition-all ${
                activeTab === 'citizen'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('citizen')}
            >
              Citizen
            </button>
            <button
              className={`py-3 text-center rounded-lg font-medium transition-all ${
                activeTab === 'government'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-red-600'
              }`}
              onClick={() => {
                setActiveTab('government');
                setIsRegister(false); // Force sign-in mode for government
                setError(null); // Clear any existing errors
              }}
            >
              Government
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              {isRegister && (
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === 'citizen'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                }`}
              >
                {isRegister ? 'Create Account' : 'Sign In'}
              </button>

              {/* Only show registration toggle for citizen accounts */}
              {activeTab === 'citizen' && (
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                </button>
              )}


            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;