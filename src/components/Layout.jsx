import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Shield, Trophy, Target, DollarSign, Activity, CalendarDays, Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import fieldSvg from '/field.svg';

function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const footerExcludedPaths = ['/terms', '/privacy'];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-green-700 via-green-800 to-green-900">
      
      {/* Football Field Background - FIXED */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10 z-0"
        style={{
          backgroundImage: `url(${fieldSvg})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className="relative z-10">
        <nav className="bg-gradient-to-r from-amber-900 via-green-900 to-amber-900 bg-opacity-95 backdrop-blur-sm shadow-lg border-b-4 border-amber-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-2">
                  <Trophy className="h-8 w-8 text-amber-400" />
                  <span className="text-xl font-bold text-amber-100">603D</span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              {user && (
                <div className="hidden md:flex items-center space-x-6">
                  <Link 
                    to="/pools" 
                    className="text-amber-200 hover:text-amber-400 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Pools
                  </Link>
                  
                  <Link 
                    to="/my-picks" 
                    className="text-amber-200 hover:text-amber-400 px-3 py-2 text-sm font-medium flex items-center space-x-1 transition-colors"
                  >
                    <Target className="h-4 w-4" />
                    <span>My Picks</span>
                  </Link>
                  
                  <Link 
                    to="/side-bets" 
                    className="text-amber-200 hover:text-amber-400 px-3 py-2 text-sm font-medium flex items-center space-x-1 transition-colors"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Side Bets</span>
                  </Link>

                  <Link
                    to="/upcoming-games"
                    className="text-amber-200 hover:text-amber-400 px-3 py-2 text-sm font-medium flex items-center space-x-1 transition-colors"
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span>NFL Games</span>
                  </Link>
                  
                  {/* Desktop Dropdown for Stats */}
                  <div className="relative group">
                    <button className="text-amber-200 hover:text-amber-400 px-3 py-2 text-sm font-medium flex items-center space-x-1 transition-colors">
                      <Activity className="h-4 w-4" />
                      <span>Stats</span>
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className="absolute left-0 mt-1 w-48 bg-gradient-to-b from-amber-900 to-green-900 rounded-md shadow-lg border-2 border-amber-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        <Link 
                          to="/pools/1/live-scores" 
                          className="block px-4 py-2 text-sm text-amber-200 hover:bg-amber-800 hover:text-amber-100"
                        >
                          Stats
                        </Link>
                        <Link 
                          to="/pools/1/leaderboard" 
                          className="block px-4 py-2 text-sm text-amber-200 hover:bg-amber-800 hover:text-amber-100"
                        >
                          Leaderboard
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin() && (
                    <Link 
                      to="/admin" 
                      className="text-amber-200 hover:text-amber-400 px-3 py-2 text-sm font-medium flex items-center space-x-1 transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                </div>
              )}

              {/* Desktop Profile / Mobile Hamburger */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    {/* Desktop Profile Dropdown */}
                    <div className="hidden md:block relative group">
                      <button className="flex items-center space-x-2 text-amber-100 hover:text-amber-400 px-3 py-2 text-sm font-medium transition-colors">
                        <User className="h-4 w-4" />
                        <span className="max-w-[150px] truncate">{user.username}</span>
                        {isAdmin() && (
                          <span className="bg-amber-600 text-amber-100 text-xs px-2 py-1 rounded-full">
                            Admin
                          </span>
                        )}
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <div className="absolute right-0 mt-1 w-48 bg-gradient-to-b from-amber-900 to-green-900 rounded-md shadow-lg border-2 border-amber-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-1">
                          <Link 
                            to="/profile" 
                            className="block px-4 py-2 text-sm text-amber-200 hover:bg-amber-800 hover:text-amber-100 flex items-center space-x-2"
                          >
                            <User className="h-4 w-4" />
                            <span>My Profile</span>
                          </Link>
                          
                          <div className="border-t border-amber-700 my-1"></div>
                          
                          <button
                            onClick={handleLogout}
                            className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-amber-800 flex items-center space-x-2"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="md:hidden p-2 rounded-lg text-amber-200 hover:text-amber-400 hover:bg-amber-800/30 transition-colors"
                      aria-label="Toggle menu"
                    >
                      {mobileMenuOpen ? (
                        <X className="h-6 w-6" />
                      ) : (
                        <Menu className="h-6 w-6" />
                      )}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Slide-Out Menu */}
        {user && (
          <>
            {/* Backdrop */}
            <div 
              className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
                mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Menu */}
            <div 
              className={`fixed top-0 right-0 h-full w-[280px] bg-gradient-to-b from-amber-900 via-green-900 to-amber-900 shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
                mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b-2 border-amber-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-amber-400" />
                    <span className="text-amber-100 font-bold truncate max-w-[150px]">
                      {user.username}
                    </span>
                    {isAdmin() && (
                      <span className="bg-amber-600 text-amber-100 text-xs px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-amber-200 hover:text-amber-400 hover:bg-amber-800/30 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-4">
                  <Link 
                    to="/pools"
                    className="flex items-center space-x-3 px-6 py-3 text-amber-200 hover:text-amber-400 hover:bg-amber-800/30 transition-colors"
                  >
                    <Trophy className="h-5 w-5" />
                    <span className="font-medium">Pools</span>
                  </Link>

                  <Link 
                    to="/my-picks"
                    className="flex items-center space-x-3 px-6 py-3 text-amber-200 hover:text-amber-400 hover:bg-amber-800/30 transition-colors"
                  >
                    <Target className="h-5 w-5" />
                    <span className="font-medium">My Picks</span>
                  </Link>

                  <Link 
                    to="/side-bets"
                    className="flex items-center space-x-3 px-6 py-3 text-amber-200 hover:text-amber-400 hover:bg-amber-800/30 transition-colors"
                  >
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">Side Bets</span>
                  </Link>

                  <Link 
                    to="/upcoming-games"
                    className="flex items-center space-x-3 px-6 py-3 text-amber-200 hover:text-amber-400 hover:bg-amber-800/30 transition-colors"
                  >
                    <CalendarDays className="h-5 w-5" />
                    <span className="font-medium">NFL Games</span>
                  </Link>

                  <div className="border-t border-amber-700 my-2"></div>

                  <Link 
                    to="/pools/1/live-scores"
                    className="flex items-center space-x-3 px-6 py-3 text-amber-200 hover:text-amber-400 hover:bg-amber-800/30 transition-colors"
                  >
                    <Activity className="h-5 w-5" />
                    <span className="font-medium">Stats</span>
                  </Link>

                  <Link 
                    to="/pools/1/leaderboard"
                    className="flex items-center space-x-3 px-6 py-3 text-amber-200 hover:text-amber-400 hover:bg-amber-800/30 transition-colors"
                  >
                    <Trophy className="h-5 w-5" />
                    <span className="font-medium">Leaderboard</span>
                  </Link>

                  {isAdmin() && (
                    <>
                      <div className="border-t border-amber-700 my-2"></div>
                      <Link 
                        to="/admin"
                        className="flex items-center space-x-3 px-6 py-3 text-amber-200 hover:text-amber-400 hover:bg-amber-800/30 transition-colors"
                      >
                        <Shield className="h-5 w-5" />
                        <span className="font-medium">Admin</span>
                      </Link>
                    </>
                  )}

                  <div className="border-t border-amber-700 my-2"></div>

                  <Link 
                    to="/profile"
                    className="flex items-center space-x-3 px-6 py-3 text-amber-200 hover:text-amber-400 hover:bg-amber-800/30 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="border-t-2 border-amber-600 p-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {!footerExcludedPaths.includes(location.pathname) && (
          <footer className="bg-gradient-to-r from-green-950 via-amber-950 to-green-950 bg-opacity-95 backdrop-blur-sm text-white py-8 mt-20 text-center relative overflow-hidden border-t-4 border-amber-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Brand Section */}
                <div>
                  <div className="flex items-center justify-center md:justify-start mb-4">
                    <svg width="120" height="80" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="60" cy="40" rx="55" ry="35" fill="#8B4513" stroke="#D2691E" strokeWidth="2"/>
                      <line x1="60" y1="15" x2="60" y2="65" stroke="#F4A460" strokeWidth="2"/>
                      <line x1="50" y1="20" x2="70" y2="20" stroke="#F4A460" strokeWidth="1.5"/>
                      <line x1="50" y1="28" x2="70" y2="28" stroke="#F4A460" strokeWidth="1.5"/>
                      <line x1="50" y1="36" x2="70" y2="36" stroke="#F4A460" strokeWidth="1.5"/>
                      <line x1="50" y1="44" x2="70" y2="44" stroke="#F4A460" strokeWidth="1.5"/>
                      <line x1="50" y1="52" x2="70" y2="52" stroke="#F4A460" strokeWidth="1.5"/>
                      <line x1="50" y1="60" x2="70" y2="60" stroke="#F4A460" strokeWidth="1.5"/>
                      <text x="60" y="48" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="900" fill="#FFF" textAnchor="middle" stroke="#000" strokeWidth="0.5">603D</text>
                      <ellipse cx="40" cy="25" rx="15" ry="10" fill="#D2691E" opacity="0.3"/>
                    </svg>
                  </div>
                  <p className="text-amber-200 text-sm px-4">
                    The ultimate NFL prediction platform with live scores, side bets, and real-time updates.
                  </p>
                </div>
                
                {/* Quick Links */}
                <div>
                  <h3 className="font-semibold mb-4 text-amber-100">Quick Links</h3>
                  <div className="space-y-2 text-sm">
                    <Link to="/pools" className="block text-amber-200 hover:text-amber-400 transition-colors">
                      Active Pools
                    </Link>
                    <Link to="/side-bets" className="block text-amber-200 hover:text-amber-400 transition-colors">
                      Side Bets
                    </Link>
                    <Link to="/profile" className="block text-amber-200 hover:text-amber-400 transition-colors">
                      My Profile
                    </Link>
                  </div>
                </div>
                
                {/* Credits */}
                <div>
                  <h3 className="font-semibold mb-4 text-amber-100">Developed By</h3>
                  <div className="text-sm text-amber-200 px-4">
                    <p className="mb-2">
                      Pool coded development by{' '}
                      <a 
                        href="https://603design.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        603D
                      </a>
                    </p>
                    <p>
                      Powered by{' '}
                      <a 
                        href="https://603design.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Motivation® Institute
                      </a>
                    </p>
                  </div>
                  <p className="mt-4">
                    <Link 
                      to="/contact" 
                      className="hover:text-green-400 transition-colors text-amber-200"
                    >
                      Contact Us
                    </Link>
                  </p>
                </div>
              </div>
              
              {/* Copyright */}
              <div className="border-t border-amber-800 mt-8 pt-6 text-center text-sm text-amber-300 flex justify-center items-center space-x-2">
                <p className="m-0">&copy; {new Date().getFullYear()} NFL Pool System. All rights reserved. 🏈</p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

export default Layout;