import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award, TrendingUp, Target, RefreshCw, ChevronLeft, ChevronRight, ArrowLeft, Crown } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

function LeaderboardPage() {
  const { poolId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [poolInfo, setPoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
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
      const res = await fetch(`${API_BASE_URL}/pools`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const pools = await res.json();
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
        return <Crown className="h-7 w-7 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return {
          bg: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
          color: '#000',
          border: '3px solid #000',
          shadow: '0 6px 20px rgba(212, 175, 55, 0.6)'
        };
      case 2:
        return {
          bg: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)',
          color: '#000',
          border: '2px solid #000',
          shadow: '0 4px 15px rgba(156, 163, 175, 0.4)'
        };
      case 3:
        return {
          bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#000',
          border: '2px solid #000',
          shadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
        };
      default:
        return {
          bg: 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
          color: '#fff',
          border: '2px solid #4b5563',
          shadow: 'none'
        };
    }
  };

  const isCurrentUser = (username) => {
    return user?.username === username;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex justify-center items-center" style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400 mx-auto mb-4" style={{
            borderTopColor: '#d4af37',
          }}></div>
          <p className="text-yellow-400 font-bold uppercase">Loading Standings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
    }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/pools')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
              color: '#d4af37',
              border: '2px solid #d4af37',
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Pools</span>
          </button>
          
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

        {/* Title Card */}
        <div className="rounded-xl overflow-hidden text-center" style={{
          background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
          border: '3px solid #d4af37',
          boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
        }}>
          <div className="p-6 border-b-2" style={{
            background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
            borderColor: '#d4af37',
          }}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="h-10 w-10 text-yellow-400" />
              <h1 className="text-4xl font-black text-white" style={{
                textShadow: '2px 2px 0 #000, -1px -1px 0 #d4af37',
                fontFamily: 'Impact, sans-serif',
              }}>
                LEADERBOARD
              </h1>
              <Trophy className="h-10 w-10 text-yellow-400" />
            </div>
            {poolInfo && (
              <div>
                <p className="text-slate-300 font-bold text-lg">
                  {poolInfo.name}
                </p>
                <p className="text-yellow-400 font-black uppercase text-sm">
                  WEEK {poolInfo.week_number}
                </p>
              </div>
            )}
          </div>
          <div className="p-4" style={{
            background: 'rgba(212, 175, 55, 0.1)',
          }}>
            <p className="text-slate-300 font-semibold">
              {total} {total === 1 ? 'Competitor' : 'Competitors'} • Battle for the Top
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl p-4" style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            border: '2px solid #000',
          }}>
            <p className="text-white font-bold text-center">{error}</p>
          </div>
        )}

        {/* Leaderboard Content */}
        {leaderboard.length === 0 ? (
          <div className="rounded-xl overflow-hidden text-center" style={{
            background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
            border: '3px solid #d4af37',
          }}>
            <div className="p-12">
              <Trophy className="h-24 w-24 text-yellow-400 mx-auto mb-6 opacity-50" />
              <h3 className="text-3xl font-black text-white mb-4" style={{
                fontFamily: 'Impact, sans-serif',
              }}>NO SCORES YET</h3>
              <p className="text-slate-300 font-semibold mb-8 text-lg">
                The leaderboard will light up once games are completed and scored!
              </p>
              
              <div className="rounded-lg p-8 max-w-3xl mx-auto" style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '2px solid #d4af37',
              }}>
                <h4 className="text-2xl font-black text-yellow-400 mb-6 uppercase" style={{
                  fontFamily: 'Impact, sans-serif',
                }}>How to Win:</h4>
                <div className="space-y-5 text-left">
                  {[
                    { num: '1', title: 'Make Your Picks', desc: 'Select winning teams for each game before the pool deadline' },
                    { num: '2', title: 'Assign Confidence', desc: 'Rank your picks from most confident (16) to least confident (1)' },
                    { num: '3', title: 'Earn Points', desc: 'Correct picks earn the confidence points you assigned to them' },
                    { num: '4', title: 'Win the Pool', desc: 'Player with the most total points takes home the glory!' }
                  ].map((step) => (
                    <div key={step.num} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full font-black flex items-center justify-center text-lg" style={{
                        background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                        color: '#000',
                        border: '2px solid #000',
                      }}>
                        {step.num}
                      </div>
                      <div>
                        <p className="text-white font-black text-lg">{step.title}</p>
                        <p className="text-slate-300 font-semibold">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {poolInfo && new Date() < new Date(poolInfo.start_date) && (
                <div className="mt-8 p-4 rounded-lg" style={{
                  background: 'rgba(212, 175, 55, 0.2)',
                  border: '2px solid #d4af37',
                }}>
                  <p className="text-yellow-400 font-bold text-lg">
                    ⏰ Pool starts {new Date(poolInfo.start_date).toLocaleDateString()} at {new Date(poolInfo.start_date).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Leaderboard Table */}
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const rankStyle = getRankStyle(entry.rank);
                const isUser = isCurrentUser(entry.username);
                
                return (
                  <div
                    key={index}
                    className="rounded-xl overflow-hidden transition-all"
                    style={{
                      background: isUser 
                        ? 'linear-gradient(145deg, #1e40af 0%, #1e3a8a 100%)'
                        : rankStyle.bg,
                      border: isUser ? '3px solid #3b82f6' : rankStyle.border,
                      boxShadow: isUser 
                        ? '0 6px 20px rgba(59, 130, 246, 0.6)' 
                        : rankStyle.shadow,
                      animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <div className="p-5 flex items-center justify-between gap-4">
                      {/* Rank Section */}
                      <div className="flex items-center gap-4 min-w-[120px]">
                        {getRankIcon(entry.rank)}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full font-black text-xl" style={{
                          background: entry.rank <= 3 ? '#000' : '#374151',
                          color: entry.rank <= 3 ? '#d4af37' : '#fff',
                          border: entry.rank <= 3 ? '2px solid #d4af37' : 'none',
                        }}>
                          {entry.rank}
                        </div>
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-lg font-black truncate ${
                            isUser ? 'text-white' : (entry.rank <= 3 ? 'text-black' : 'text-white')
                          }`} style={{
                            fontFamily: 'Impact, sans-serif',
                          }}>
                            {entry.display_name || entry.username}
                          </span>
                          {isUser && (
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase" style={{
                              background: '#3b82f6',
                              color: '#fff',
                              border: '2px solid #fff',
                            }}>
                              YOU
                            </span>
                          )}
                        </div>
                        {entry.display_name && (
                          <div className={`text-sm font-semibold ${
                            isUser ? 'text-blue-200' : (entry.rank <= 3 ? 'text-gray-700' : 'text-slate-400')
                          }`}>
                            @{entry.username}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6">
                        {/* Points */}
                        <div className="text-center">
                          <div className={`text-xs font-bold uppercase mb-1 ${
                            isUser ? 'text-blue-200' : (entry.rank <= 3 ? 'text-gray-700' : 'text-slate-400')
                          }`}>
                            Points
                          </div>
                          <div className={`text-2xl font-black ${
                            isUser ? 'text-white' : (entry.rank <= 3 ? 'text-black' : 'text-yellow-400')
                          }`} style={{
                            fontFamily: 'Impact, sans-serif',
                          }}>
                            {entry.total_points}
                          </div>
                        </div>

                        {/* Correct */}
                        <div className="text-center hidden sm:block">
                          <div className={`text-xs font-bold uppercase mb-1 ${
                            isUser ? 'text-blue-200' : (entry.rank <= 3 ? 'text-gray-700' : 'text-slate-400')
                          }`}>
                            Correct
                          </div>
                          <div className={`text-lg font-black ${
                            isUser ? 'text-white' : (entry.rank <= 3 ? 'text-black' : 'text-white')
                          }`}>
                            {entry.correct_picks}/{entry.total_picks}
                          </div>
                        </div>

                        {/* Accuracy */}
                        <div className="text-center hidden md:block min-w-[140px]">
                          <div className={`text-xs font-bold uppercase mb-2 ${
                            isUser ? 'text-blue-200' : (entry.rank <= 3 ? 'text-gray-700' : 'text-slate-400')
                          }`}>
                            Accuracy
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-3 rounded-full overflow-hidden" style={{
                              background: isUser ? 'rgba(255,255,255,0.3)' : (entry.rank <= 3 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)'),
                            }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${entry.accuracy || 0}%`,
                                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                }}
                              />
                            </div>
                            <span className={`text-sm font-black ${
                              isUser ? 'text-white' : (entry.rank <= 3 ? 'text-black' : 'text-white')
                            }`}>
                              {entry.accuracy || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="rounded-xl p-5 flex items-center justify-between" style={{
                background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
                border: '2px solid #d4af37',
              }}>
                <div className="text-slate-300 font-bold">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
                      color: '#d4af37',
                      border: '2px solid #d4af37',
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
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
                          className="px-4 py-2 rounded-lg text-sm font-black transition-all"
                          style={{
                            background: currentPage === pageNum
                              ? 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)'
                              : 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
                            color: currentPage === pageNum ? '#000' : '#d4af37',
                            border: currentPage === pageNum ? '2px solid #000' : '2px solid #4b5563',
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
                      color: '#d4af37',
                      border: '2px solid #d4af37',
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="rounded-xl p-6" style={{
              background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
              border: '2px solid #d4af37',
            }}>
              <h3 className="text-xl font-black text-yellow-400 mb-4 uppercase" style={{
                fontFamily: 'Impact, sans-serif',
              }}>
                📊 Scoring System
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}>
                  <div className="text-yellow-400 font-black mb-1">POINTS</div>
                  <div className="text-slate-300 text-sm font-semibold">
                    Earned by correct picks based on confidence points assigned
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}>
                  <div className="text-yellow-400 font-black mb-1">CORRECT</div>
                  <div className="text-slate-300 text-sm font-semibold">
                    Number of winning picks out of total picks made
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}>
                  <div className="text-yellow-400 font-black mb-1">ACCURACY</div>
                  <div className="text-slate-300 text-sm font-semibold">
                    Percentage of correct picks made
                  </div>
                </div>
              </div>
            </div>
          </>
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

export default LeaderboardPage;