import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Calendar, Users, Trophy, Clock, Target, CheckCircle, XCircle, Clock3, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config/api';

function MyPicksPage() {
  const [picksByPool, setPicksByPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const { showSuccess, showError, showInfo, showProfessional } = useToast();

  useEffect(() => {
    fetchMyPicks();
  }, []);

  const fetchMyPicks = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        showInfo('Refreshing your picks...');
      }
      const res = await fetch(`${API_BASE_URL}/my-picks`, {
      
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPicksByPool(data);
        setError('');
        
        if (isRefresh) {
          showSuccess('Picks updated successfully!');
        }
      } else {
        const errorText = 'Failed to fetch picks';
        setError(errorText);
        showError(errorText);
      }
    } catch (error) {
      console.error('Error fetching picks:', error);
      const errorText = 'Network error fetching picks';
      setError(errorText);
      showError(errorText);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchMyPicks(true);
  };

  const getPickResultIcon = (result, gameStatus) => {
    if (gameStatus !== 'completed') {
      return <Clock3 className="h-4 w-4 text-yellow-500" />;
    }
    
    switch (result) {
      case 'correct':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'incorrect':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock3 className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getGameResult = (homeTeam, awayTeam, homeScore, awayScore, gameStatus) => {
    if (gameStatus !== 'completed' || homeScore === null || awayScore === null) {
      return 'TBD';
    }
    return `${homeScore} - ${awayScore}`;
  };

  const getWinningTeam = (homeTeam, awayTeam, homeScore, awayScore, gameStatus) => {
    if (gameStatus !== 'completed' || homeScore === null || awayScore === null) {
      return null;
    }
    return homeScore > awayScore ? homeTeam : awayTeam;
  };

  const handleEditPicksClick = (poolName) => {
    showProfessional(`Opening picks editor for ${poolName}`);
  };

  const handleLeaderboardClick = (poolName) => {
    showInfo(`Loading leaderboard for ${poolName}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#d4af37' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
    }}>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-black text-4xl md:text-5xl mb-2" style={{
              color: '#fff',
              textShadow: '2px 2px 0 #000, -1px -1px 0 #d4af37, 1px -1px 0 #d4af37, -1px 1px 0 #d4af37, 1px 1px 0 #d4af37',
              fontFamily: 'Impact, "Arial Black", sans-serif',
            }}>MY PICKS</h1>
            <p className="text-slate-300 text-lg font-semibold">Track your picks across all pools • Your game, your choices</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold uppercase text-sm transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
              color: '#000',
              border: '2px solid #000',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
            }}
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-600 border-2 border-red-800 text-white px-4 py-3 rounded-lg font-bold mb-6">
            {error}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {picksByPool.length === 0 ? (
          <div className="text-center py-16 rounded-xl" style={{
            background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
            border: '3px solid #d4af37',
          }}>
            <Target className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2" style={{
              fontFamily: 'Impact, sans-serif',
            }}>NO PICKS YET</h3>
            <p className="text-slate-300 mb-6">You haven't made any picks yet. Join a pool and start picking!</p>
            <Link
              to="/pools"
              onClick={() => showInfo('Looking for available pools...')}
              className="inline-block px-6 py-3 rounded-lg font-bold uppercase"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                color: '#000',
                border: '2px solid #000',
              }}
            >
              View Available Pools
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {picksByPool.map((poolData) => (
              <div key={poolData.pool.id} className="rounded-xl overflow-hidden" style={{
                background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
                border: '3px solid #d4af37',
                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
              }}>
                {/* Pool Header */}
                <div className="p-6 border-b-2" style={{
                  background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
                  borderColor: '#d4af37',
                }}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2" style={{
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        fontFamily: 'Impact, sans-serif',
                      }}>
                        {poolData.pool.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center text-slate-300 font-semibold">
                          <Calendar className="h-4 w-4 mr-1" />
                          Week {poolData.pool.week_number}, {poolData.pool.season_year}
                        </span>
                        <span className={`px-3 py-1 text-xs font-black uppercase rounded-full ${
                          poolData.pool.status === 'active' 
                            ? 'bg-green-500 text-white' 
                            : poolData.pool.status === 'upcoming' 
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {poolData.pool.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Pool Stats */}
                    <div className="text-left md:text-right">
                      <div className="text-4xl font-black text-yellow-400 mb-1" style={{
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      }}>
                        {poolData.stats.totalPoints}
                      </div>
                      <div className="text-sm text-slate-300 font-bold uppercase">Points</div>
                      <div className="text-sm text-slate-400 mt-1 font-semibold">
                        {poolData.stats.correct}/{poolData.stats.total} correct
                      </div>
                      {poolData.stats.correct === poolData.stats.total && poolData.stats.total > 0 && (
                        <div className="text-sm text-green-400 mt-1 font-black uppercase">🏆 Perfect Week!</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Picks List */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {poolData.picks.map((pick) => {
                      const winningTeam = getWinningTeam(
                        pick.home_team, 
                        pick.away_team, 
                        pick.home_score, 
                        pick.away_score, 
                        pick.game_status
                      );
                      
                      return (
                        <div key={pick.game_id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-lg transition-all hover:scale-[1.02]" style={{
                          background: 'rgba(212, 175, 55, 0.1)',
                          border: '2px solid rgba(212, 175, 55, 0.3)',
                        }}>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Result Icon */}
                            <div className="flex-shrink-0">
                              {getPickResultIcon(pick.pick_result, pick.game_status)}
                            </div>
                            
                            {/* Game Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black text-white text-sm md:text-base">
                                  {pick.away_team} @ {pick.home_team}
                                </span>
                                {winningTeam && (
                                  <span className="text-xs font-bold px-2 py-1 rounded" style={{
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#10b981',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                  }}>
                                    Winner: {winningTeam}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 mt-1 font-semibold">
                                {format(new Date(pick.game_date), 'MMM d, yyyy h:mm a')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {/* Your Pick */}
                            <div className="text-left md:text-right">
                              <div className={`font-black text-sm ${
                                pick.selected_team === winningTeam ? 'text-green-400' : 
                                pick.game_status === 'completed' && winningTeam ? 'text-red-400' : 
                                'text-white'
                              }`}>
                                Picked: {pick.selected_team}
                              </div>
                              <div className="text-xs text-slate-400 font-semibold">
                                {pick.confidence_points || 1} {pick.confidence_points === 1 ? 'point' : 'points'}
                              </div>
                            </div>
                            
                            {/* Score */}
                            <div className="text-right min-w-[60px]">
                              <div className="font-mono font-black text-sm text-yellow-400">
                                {getGameResult(pick.home_team, pick.away_team, pick.home_score, pick.away_score, pick.game_status)}
                              </div>
                              <div className="text-xs text-slate-400 font-semibold uppercase">
                                {pick.game_status === 'completed' ? 'Final' : 
                                 pick.game_status === 'in_progress' ? 'Live' : 'Scheduled'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pool Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2" style={{
                    borderColor: 'rgba(212, 175, 55, 0.3)',
                  }}>
                    <Link
                      to={`/pools/${poolData.pool.id}/picks`}
                      onClick={() => handleEditPicksClick(poolData.pool.name)}
                      className="flex-1 text-center py-3 rounded-lg font-black uppercase text-sm transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                        color: '#000',
                        border: '2px solid #000',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                      }}
                    >
                      ✏️ Edit Picks
                    </Link>
                    <Link
                      to={`/pools/${poolData.pool.id}/leaderboard`}
                      onClick={() => handleLeaderboardClick(poolData.pool.name)}
                      className="flex-1 text-center py-3 rounded-lg font-black uppercase text-sm transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
                        color: '#d4af37',
                        border: '2px solid #d4af37',
                      }}
                    >
                      🏆 View Leaderboard
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPicksPage;