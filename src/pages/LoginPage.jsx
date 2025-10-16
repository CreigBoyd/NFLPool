import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Trophy, AlertCircle } from 'lucide-react';
import AgeVerification from '../components/AgeVerification';

import yourVideoFile from '../assets/3D Explainer Video.mp4';
import { Link } from 'react-router-dom';

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { login, register, isAdmin } = useAuth();
  const { showSuccess, showError, showWarning, showProfessional } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we should start in signup mode based on route
  useEffect(() => {
    if (location.pathname === '/register') {
      // Check age verification before showing signup
      const verified = sessionStorage.getItem('age_verified');
      if (verified) {
        setIsSignUp(true);
      } else {
        setShowAgeVerification(true);
      }
    }
  }, [location]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(loginData.username, loginData.password);

    if (result.success) {
      // Check if user is admin and redirect accordingly
      if (isAdmin()) {
        showProfessional(`Welcome back, Admin ${loginData.username}! Redirecting to dashboard...`);
        navigate('/admin');
      } else {
        showSuccess(`Welcome back, ${loginData.username}!`);
        navigate('/pools');
      }
    } else {
      showError(result.error);
    }

    setLoading(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Password validation
    if (signupData.password !== signupData.confirmPassword) {
      showWarning('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (signupData.password.length < 6) {
      showWarning('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await register(signupData.username, signupData.email, signupData.password);

    if (result.success) {
      // Show professional message about pending approval
      showProfessional('Registration submitted! Your account is awaiting admin approval. You will be notified once approved.');
      setSignupData({ username: '', email: '', password: '', confirmPassword: '' });
      // Switch back to login after delay
      setTimeout(() => {
        setIsSignUp(false);
      }, 4000);
    } else {
      showError(result.error);
    }

    setLoading(false);
  };

  const switchToSignUp = () => {
    // Check if already verified in this session
    const verified = sessionStorage.getItem('age_verified');
    if (verified) {
      setIsSignUp(true);
      setError('');
      setSuccessMessage('');
    } else {
      // Show age verification modal first
      setShowAgeVerification(true);
    }
  };

  const switchToLogin = () => {
    setIsSignUp(false);
    setError('');
    setSuccessMessage('');
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    setIsSignUp(true);
    setError('');
    setSuccessMessage('');
  };

  const handleAgeCancelled = () => {
    setShowAgeVerification(false);
  };

  return (
    <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
      {/* Age Verification Modal */}
      <AgeVerification 
        isOpen={showAgeVerification}
        onVerified={handleAgeVerified}
        onCancel={handleAgeCancelled}
      />

      {/* Background gradient effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl"></div>

      {/* Video in top right corner */}
      <div className="absolute top-8 right-8 z-20">
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-green-600/30">
          <video
            className="w-64 h-36 object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={yourVideoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Main Content - Centered Form */}
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        {/* Animated Form Container */}
        <div className="relative" style={{ width: '700px', height: '450px' }}>
          {/* Background sliding panel */}
          <div 
            className="absolute w-full transition-all duration-700 ease-in-out clock"
            style={{ 
              height: '100%',
              display: 'flex'
            }}
          >
            {/* Login message */}
            <div 
              className={`w-1/2 h-full flex items-center justify-center transition-opacity duration-700 ${isSignUp ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="text-white text-center px-8">
                <div className="flex justify-center mb-4">
                  <Trophy className="h-14 w-14 text-green-600" />
                </div>
                <div className="hero mb-8">
                  <h1 style={{ fontSize: '48px', margin: 0 }}>603D</h1>
                  <h2 style={{ fontSize: '32px', margin: 0 }}>Phantom</h2>
                  <p style={{ fontSize: '16px', margin: 0 }}>NFL / Pool</p>
                </div>
                <p className="font-light text-3xl mb-3">Don't have an account?</p>
                <p className="font-thin text-lg mb-6">Sign up to save all your picks.</p>
                <button
                  onClick={switchToSignUp}
                  className="bg-gray-800 border-2 border-white rounded-lg text-white text-sm font-light px-6 py-3 hover:bg-gray-700 transition-colors"
                >
                  SIGN UP 
                </button>
              </div>
            </div>

            {/* Signup message */}
            <div 
              className={`w-1/2 h-full flex items-center justify-center transition-opacity duration-700 ${!isSignUp ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="text-white text-center px-8">
                <div className="flex justify-center mb-4">
                  <Trophy className="h-14 w-14 text-green-600" />
                </div>
                <div className="hero mb-8">
                  <h1 style={{ fontSize: '48px', margin: 0 }}>603D</h1>
                  <h2 style={{ fontSize: '32px', margin: 0 }}>Phantom</h2>
                  <p style={{ fontSize: '16px', margin: 0 }}>NFL / Pool</p>
                </div>
                <p className="font-light text-3xl mb-3">Have an account?</p>
                <p className="font-thin text-lg mb-6">Log in to see all your picks.</p>
                <button
                  onClick={switchToLogin}
                  className="bg-gray-800 border-2 border-white rounded-lg text-white text-sm font-light px-6 py-3 hover:bg-gray-700 transition-colors"
                >
                  LOG IN
                </button>
              </div>
            </div>
          </div>

          {/* Front sliding form panel */}
          <div 
            className={`absolute clock h-full w-1/2 z-10 transition-all duration-700 ease-in-out`}
            style={{ 
              borderRadius: '20px',
              right: isSignUp ? '48%' : '2%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Error/Success Messages */}
            {error && (
              <div className="absolute top-4 left-4 right-4 rounded-md bg-red-50 p-3 z-20">
                <div className="flex">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <div className="ml-2">
                    <p className="text-xs font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="absolute top-4 left-4 right-4 rounded-md bg-green-50 p-3 z-20">
                <div className="flex">
                  <Trophy className="h-4 w-4 text-green-400" />
                  <div className="ml-2">
                    <p className="text-xs font-medium text-green-800">{successMessage}</p>
                    <p className="text-xs text-green-700 mt-1">Switching to login...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <div className={`p-8 text-center h-full flex flex-col justify-center ${isSignUp ? 'hidden' : 'block'}`}>
              <h2 className="text-white text-2xl font-normal mb-8">LOG IN 🏈</h2>
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="  USERNAME"
                    required
                    value={loginData.username}
                    onChange={handleLoginChange}
                    className="block w-full h-12 text-white clock border-none text-sm px-4"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="  PASSWORD"
                    required
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="block w-full h-12 text-white clock border-none text-sm px-4"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <p
                  onClick={() => navigate('/forgot-password')}
                  className="cursor-pointer text-gray-300 text-sm hover:text-gray-600"
                >
                  FORGOT PASSWORD?
                </p>
                <button className="button" type="submit" disabled={loading} data-hover="Good Luck !" data-active="IT'S FREE">
                  <span style={{ display: 'inline-block', minWidth: 100, textAlign: 'center' }}>
                    {loading ? 'Signing in...' : 'LOG IN'}
                  </span>
                </button>
              </form>
            </div>

            {/* Signup Form */}
            <div className={`p-8 text-center h-full flex flex-col justify-center ${!isSignUp ? 'hidden' : 'block'}`}>
              <h2 className="text-white text-2xl font-normal mb-6">SIGN UP 🏈</h2>
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="  USERNAME"
                    required
                    value={signupData.username}
                    onChange={handleSignupChange}
                    className="block w-full h-11 clock border-none text-sm px-4"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="  EMAIL"
                    required
                    value={signupData.email}
                    onChange={handleSignupChange}
                    className="block w-full h-11 clock border-none text-sm px-4"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="  PASSWORD (MIN 6 CHARS)"
                    required
                    value={signupData.password}
                    onChange={handleSignupChange}
                    className="block w-full h-11 clock border-none text-sm px-4"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="  CONFIRM PASSWORD"
                    required
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    className="block w-full h-11 clock border-none text-sm px-4"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <button className="button" type="submit" disabled={loading} data-hover="WELCOME" data-active="IT'S FREE">
                  <span style={{ display: 'inline-block', minWidth: 100, textAlign: 'center' }}>
                    {loading ? 'SUBMITTING...' : 'SIGN UP'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <div className="text-gray-500 text-sm space-y-1">
            <p>© 2025 603D Phantom. All rights reserved.</p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <Link to="/terms" className="hover:text-green-400 transition">
        Terms of Service
      </Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-green-400 transition">
        Privacy Policy
      </Link>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;