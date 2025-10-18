import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Calendar, Users, Trophy, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config/api';

function PoolCard({ pool, onMakePicksClick, onLeaderboardClick }) {
  const getPoolStatusMessage = (status) => {
    switch (status) {
      case 'active':
        return 'Live and accepting picks';
      case 'upcoming':
        return 'Opens soon';
      case 'completed':
        return 'Season finished';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: '#10b981', text: '#fff' };
      case 'upcoming': return { bg: '#f59e0b', text: '#000' };
      case 'completed': return { bg: '#6b7280', text: '#fff' };
      default: return { bg: '#6b7280', text: '#fff' };
    }
  };

  const statusColors = getStatusColor(pool.status);

  return (
    <div className="rounded-xl overflow-hidden transition-transform hover:scale-105" style={{
      background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
      border: '3px solid #d4af37',
      boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
    }}>
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b-2" style={{
        background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
        borderColor: '#d4af37',
      }}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="px-3 py-1 text-xs font-black uppercase rounded-full" style={{
            backgroundColor: statusColors.bg,
            color: statusColors.text,
          }}>
            {pool.status}
          </span>
          
          <div className="flex items-center text-yellow-400 text-sm font-black uppercase" style={{
            fontFamily: '"Arial Black", sans-serif',
          }}>
            <Trophy className="h-4 w-4 mr-1" />
            WEEK {pool.week_number}
          </div>
        </div>
        
        <h3 className="text-lg sm:text-xl font-black text-white leading-tight break-words" style={{
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          fontFamily: 'Impact, sans-serif',
        }}>{pool.name}</h3>
      </div>
      
      {/* Card Body */}
      <div className="p-4 sm:p-5">
        {/* Pool Info */}
        <div className="space-y-3 mb-5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs sm:text-sm font-semibold uppercase flex items-center">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              Season:
            </span>
            <span className="font-black text-white">{pool.season_year}</span>
          </div>
          
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-400 text-xs sm:text-sm font-semibold uppercase flex items-center flex-shrink-0">
              <Clock className="h-4 w-4 mr-2" />
              Starts:
            </span>
            <span className="font-bold text-white text-xs text-right">{format(new Date(pool.start_date), 'MMM d, yyyy h:mm a')}</span>
          </div>

          {pool.participant_count && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs sm:text-sm font-semibold uppercase flex items-center">
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                Players:
              </span>
              <span className="font-black text-yellow-400">{pool.participant_count}</span>
            </div>
          )}

          {/* Status Message */}
          <div className="p-2 rounded" style={{
            background: 'rgba(212, 175, 55, 0.1)',
          }}>
            <div className="flex items-center justify-center text-yellow-400 text-xs font-bold uppercase">
              <AlertCircle className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="text-center">{getPoolStatusMessage(pool.status)}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {pool.status === 'completed' ? (
            <button
              onClick={() => onMakePicksClick(pool.name, pool.status)}
              disabled
              className="w-full py-3 rounded-lg font-black uppercase text-xs sm:text-sm text-center cursor-not-allowed opacity-50"
              style={{
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: '#fff',
                border: '2px solid #374151',
              }}
            >
              PICKS CLOSED
            </button>
          ) : (
            <Link
              to={`/pools/${pool.id}/picks`}
              onClick={() => onMakePicksClick(pool.name, pool.status)}
              className="block w-full py-3 rounded-lg font-black uppercase text-xs sm:text-sm text-center transition-all"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                color: '#000',
                border: '2px solid #000',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
              }}
            >
              🏈 {pool.status === 'upcoming' ? 'PREVIEW PICKS' : 'MAKE PICKS'} 🏈
            </Link>
          )}
          
          <Link
            to={`/pools/${pool.id}/leaderboard`}
            onClick={() => onLeaderboardClick(pool.name)}
            className="block w-full py-3 rounded-lg font-black uppercase text-xs sm:text-sm text-center transition-all"
            style={{
              background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
              color: '#d4af37',
              border: '2px solid #d4af37',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>LEADERBOARD</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function PoolsPage() {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const { showSuccess, showError, showInfo, showProfessional, showWarning } = useToast();

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        showInfo('Refreshing available pools...');
      }
      
      const response = await fetch(`${API_BASE_URL}/pools`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPools(data);
        
        if (isRefresh) {
          showSuccess(`Found ${data.length} available pools!`);
        }
      } else {
        const errorMessage = 'Failed to load pools. Please try again.';
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching pools:', error);
      showError('Network error loading pools. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPools(true);
  };

  const handleMakePicksClick = (poolName, poolStatus) => {
    if (poolStatus === 'completed') {
      showWarning(`${poolName} has already ended. Picks are locked.`);
      return;
    }
    if (poolStatus === 'upcoming') {
      showInfo(`Entering ${poolName}. Get ready to make your picks!`);
    } else {
      showProfessional(`Opening pick editor for ${poolName}. Good luck!`);
    }
  };

  const handleLeaderboardClick = (poolName) => {
    showInfo(`Loading standings for ${poolName}...`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex justify-center items-center" style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400 mx-auto mb-4" style={{
            borderTopColor: '#d4af37',
          }}></div>
          <p className="text-yellow-400 font-bold uppercase text-sm">Loading Pools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
    }}>
      {/* Header Section - MOBILE OPTIMIZED */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-black text-3xl sm:text-4xl md:text-5xl mb-2 break-words" style={{
              color: '#fff',
              textShadow: '2px 2px 0 #000, -1px -1px 0 #d4af37, 1px -1px 0 #d4af37, -1px 1px 0 #d4af37, 1px 1px 0 #d4af37',
              fontFamily: 'Impact, "Arial Black", sans-serif',
            }}>NFL POOLS</h1>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg font-semibold">Make your picks • Compete with others • Win big</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-lg font-bold uppercase text-xs sm:text-sm transition-all disabled:opacity-50 w-full md:w-auto"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
              color: '#000',
              border: '2px solid #000',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
            }}
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Pools Grid - MOBILE OPTIMIZED */}
        {pools.length === 0 ? (
          <div className="text-center py-12 sm:py-16 rounded-xl" style={{
            background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
            border: '3px solid #d4af37',
          }}>
            <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2" style={{
              fontFamily: 'Impact, sans-serif',
            }}>NO ACTIVE POOLS</h3>
            <p className="text-slate-300 mb-6 text-sm sm:text-base px-4">Check back later for new pools to join!</p>
            <button
              onClick={handleRefresh}
              className="px-4 sm:px-6 py-3 rounded-lg font-bold uppercase text-sm"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                color: '#000',
                border: '2px solid #000',
              }}
            >
              Check for New Pools
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pools.map((pool, index) => (
              <div
                key={pool.id}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <PoolCard 
                  pool={pool}
                  onMakePicksClick={handleMakePicksClick}
                  onLeaderboardClick={handleLeaderboardClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default PoolsPage;