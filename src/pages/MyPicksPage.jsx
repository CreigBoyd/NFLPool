import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext'; // Add toast import
import { Calendar, Users, Trophy, Clock, Target, CheckCircle, XCircle, Clock3, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

function MyPicksPage() {
  const [picksByPool, setPicksByPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const { showSuccess, showError, showInfo, showProfessional } = useToast(); // Add toast hooks

  useEffect(() => {
    fetchMyPicks();
  }, []);

  const fetchMyPicks = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        showInfo('Refreshing your picks...');
      }
      
      const response = await fetch('/api/my-picks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPicksByPool(data);
        setError(''); // Clear any previous errors
        
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4">
          <h1 className=" mb-4">My Picks</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mb-4 p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh picks"
          >
            <RefreshCw className={`h-5 w-5 text-blue-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p >Track your picks across all pools</p>
      </div>

     {picksByPool.length === 0 ? (
        <div className="max-w-lg mx-auto">
          <div className="p-0.5 rounded-[45px] bg-gradient-to-br from-gray-700/50 via-gray-300/50 to-gray-700/50">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[44px] p-10 text-center">
              <Target className="h-12 w-12 text-white/80 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2 leading-10 tracking-tight">No Picks Yet</h3>
              <p className="text-white/50 text-base font-semibold leading-8 mb-6">You haven't made any picks yet. Join a pool and start picking!</p>
              <Link
                to="/pools"
                onClick={() => showInfo('Looking for available pools...')}
                className="bg-gradient-to-r from-blue-500 to-blue-700 border border-blue-500/30 text-white px-6 py-3 rounded-xl text-sm font-medium"
              >
                View Available Pools
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 max-w-4xl mx-auto">
          {picksByPool.map((poolData) => (
            <div key={poolData.pool.id} className="max-w-3xl mx-auto w-full">
              <div className="">
                <div className=" p-8">
                  
                  {/* Pool Header */}
                  <div className="pb-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-white leading-10 tracking-tight">
                          {poolData.pool.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm mt-2">
                          <span className="flex items-center text-white/50">
                            <Calendar className="h-3 w-3 mr-1" />
                            Week {poolData.pool.week_number}, {poolData.pool.season_year}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm border ${
                            poolData.pool.status === 'active' 
                              ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                              : poolData.pool.status === 'upcoming' 
                              ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                              : 'bg-white/10 border-white/20 text-white'
                          }`}>
                            {poolData.pool.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Pool Stats */}
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-400">
                          {poolData.stats.totalPoints}
                        </div>
                        <div className="text-xs text-white/60">points</div>
                        <div className="text-sm text-white/50 mt-1">
                          {poolData.stats.correct}/{poolData.stats.total} correct
                        </div>
                        {/* Show achievement toasts based on performance */}
                        {poolData.stats.correct === poolData.stats.total && poolData.stats.total > 0 && (
                          <div className="text-xs text-green-400 mt-1 font-medium">Perfect Week!</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Picks List */}
                  <div className="py-6">
                    <div className="space-y-3">
                      {poolData.picks.map((pick) => {
                        const winningTeam = getWinningTeam(
                          pick.home_team, 
                          pick.away_team, 
                          pick.home_score, 
                          pick.away_score, 
                          pick.game_status
                        );
                        
                        return (
                          <div key={pick.game_id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                            <div className="flex items-center space-x-4 flex-1">
                              {/* Result Icon */}
                              <div className="flex-shrink-0">
                                {getPickResultIcon(pick.pick_result, pick.game_status)}
                              </div>
                              
                              {/* Game Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-white text-sm">
                                    {pick.away_team} @ {pick.home_team}
                                  </span>
                                  {winningTeam && (
                                    <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded border border-white/20">
                                      Winner: {winningTeam}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-white/50 mt-1">
                                  {format(new Date(pick.game_date), 'MMM d, yyyy h:mm a')}
                                </div>
                              </div>
                              
                              {/* Your Pick */}
                              <div className="text-right">
                                <div className={`font-medium text-sm ${
                                  pick.selected_team === winningTeam ? 'text-green-400' : 
                                  pick.game_status === 'completed' && winningTeam ? 'text-red-400' : 
                                  'text-white'
                                }`}>
                                  Picked: {pick.selected_team}
                                </div>
                                <div className="text-xs text-white/50">
                                  {pick.confidence_points || 1} {pick.confidence_points === 1 ? 'point' : 'points'}
                                </div>
                              </div>
                              
                              {/* Score */}
                              <div className="text-right min-w-[60px]">
                                <div className="font-mono text-sm text-white">
                                  {getGameResult(pick.home_team, pick.away_team, pick.home_score, pick.away_score, pick.game_status)}
                                </div>
                                <div className="text-xs text-white/50">
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
                    <div className="flex space-x-3 mt-6 pt-6 border-t border-white/10">
                      <Link
                        to={`/pools/${poolData.pool.id}/picks`}
                        onClick={() => handleEditPicksClick(poolData.pool.name)}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-700 border border-yellow-500/30 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-yellow-600 hover:to-yellow-800 transition-colors"
                      >
                        Edit Picks
                      </Link>
                      <Link
                        to={`/pools/${poolData.pool.id}/leaderboard`}
                        onClick={() => handleLeaderboardClick(poolData.pool.name)}
                        className="bg-white/10 border border-white/20 backdrop-blur-sm text-white/90 px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
                      >
                        View Leaderboard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPicksPage;