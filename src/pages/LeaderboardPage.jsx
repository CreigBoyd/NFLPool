import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award, TrendingUp, Target, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

function LeaderboardPage() {


  const { poolId } = useParams();
   const { token, user } = useAuth();
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [poolInfo, setPoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchLeaderboard();
    fetchPoolInfo();
  }, [poolId, currentPage]);

  const fetchPoolInfo = async () => {
    try {
      const poolResponse = await fetch(`${API_BASE_URL}/pools', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (poolResponse.ok) {
        const pools = await poolResponse.json();
        const pool = pools.find(p => p.id === parseInt(poolId));
        setPoolInfo(pool);
      }
    } catch (error) {
      console.error('Error fetching pool info:', error);
    }
  };

  const fetchLeaderboard = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/pools/${poolId}/leaderboard/paginated?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Network error loading leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchLeaderboard(true);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-white/10 text-white/80';
    }
  };

  const isCurrentUser = (username) => {
    return user?.username === username;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Trophy className="h-8 w-8 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        </div>
        {poolInfo && (
          <p className="text-white/60">
            {poolInfo.name} - Week {poolInfo.week_number}
          </p>
        )}
        <p className="text-white/40 text-sm mt-1">
          {total} {total === 1 ? 'participant' : 'participants'}
        </p>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
  <div className="bg-white/5 rounded-lg p-8 border border-white/10">
    <Trophy className="h-16 w-16 text-white/20 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-white mb-2 text-center">No Scores Yet</h3>
    <p className="text-white/60 text-center mb-6">The leaderboard will populate once games are completed and scored.</p>
    
    <div className="bg-white/10 rounded-lg p-6 max-w-2xl mx-auto">
      <h4 className="text-lg font-semibold text-white mb-3">How Scoring Works:</h4>
      <div className="space-y-3 text-sm text-white/70">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">1</div>
          <p><strong className="text-white">Make your picks</strong> - Select winning teams for each game before the pool deadline</p>
        </div>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">2</div>
          <p><strong className="text-white">Assign confidence points</strong> - Rank your picks from most confident to least confident</p>
        </div>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">3</div>
          <p><strong className="text-white">Earn points</strong> - Correct picks earn the confidence points you assigned</p>
        </div>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">4</div>
          <p><strong className="text-white">Win the pool</strong> - Player with most total points wins!</p>
        </div>
      </div>
    </div>
    
    {poolInfo && new Date() < new Date(poolInfo.start_date) && (
      <div className="mt-6 text-center">
        <p className="text-yellow-400 text-sm">
          ⏰ Pool starts {new Date(poolInfo.start_date).toLocaleDateString()} at {new Date(poolInfo.start_date).toLocaleTimeString()}
        </p>
      </div>
    )}
  </div>
) : (
        <>
          <div 
            className="rounded-lg overflow-hidden backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/80 uppercase tracking-wider">
                      <div className="flex items-center justify-center space-x-1">
                        <Trophy className="h-3 w-3" />
                        <span>Points</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/80 uppercase tracking-wider">
                      <div className="flex items-center justify-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>Correct</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white/80 uppercase tracking-wider">
                      <div className="flex items-center justify-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Accuracy</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={index}
                      className={`
                        transition-colors
                        ${isCurrentUser(entry.username) 
                          ? 'bg-blue-500/20 border-l-4 border-blue-500' 
                          : 'hover:bg-white/5'
                        }
                      `}
                    >
                      {/* Rank */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(entry.rank)}
                          <span
                            className={`
                              inline-flex items-center justify-center
                              w-8 h-8 rounded-full font-bold text-sm
                              ${getRankBadgeColor(entry.rank)}
                            `}
                          >
                            {entry.rank}
                          </span>
                        </div>
                      </td>

                      {/* Player */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-white">
                                {entry.display_name || entry.username}
                              </span>
                              {isCurrentUser(entry.username) && (
                                <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs rounded">
                                  You
                                </span>
                              )}
                            </div>
                            {entry.display_name && (
                              <div className="text-xs text-white/40">@{entry.username}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Points */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-white">
                          {entry.total_points}
                        </span>
                      </td>

                      {/* Correct Picks */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-white/80">
                          {entry.correct_picks}/{entry.total_picks}
                        </span>
                      </td>

                      {/* Accuracy */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-24 bg-white/10 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${entry.accuracy || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white/80">
                            {entry.accuracy || 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-sm text-white/60">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`
                          px-3 py-1 rounded-lg text-sm font-medium transition-colors
                          ${currentPage === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white/80'
                          }
                        `}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Legend */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-sm font-semibold text-white/80 mb-3">Scoring System</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-white/60">
          <div>
            <strong className="text-white/80">Points:</strong> Earned by correct picks based on confidence points assigned
          </div>
          <div>
            <strong className="text-white/80">Correct:</strong> Number of winning picks out of total picks made
          </div>
          <div>
            <strong className="text-white/80">Accuracy:</strong> Percentage of correct picks
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;