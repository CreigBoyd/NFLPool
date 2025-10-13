import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { Activity, Clock, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import io from 'socket.io-client';

function LiveScoresPage() {
  const { poolId } = useParams();
  const { token } = useAuth();
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({ pickStats: [], poolStats: {} });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Join pool room for real-time updates
    newSocket.emit('join-pool', poolId);

    // Listen for score updates
    newSocket.on('score-update', (updateData) => {
      updateGameScore(updateData);
      setLastUpdate(new Date());
    });

    // Listen for scores calculation completion
    newSocket.on('scores-updated', () => {
      // Refresh page data when scores are recalculated
      fetchData();
    });

    // Initial data fetch
    fetchData();

    // Cleanup on unmount
    return () => {
      newSocket.emit('leave-pool', poolId);
      newSocket.disconnect();
    };
  }, [poolId]);

  const fetchData = async () => {
    try {
      const [scoresResponse, statsResponse] = await Promise.all([
        fetch(`/api/pools/${poolId}/live-scores`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/pools/${poolId}/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (scoresResponse.ok) {
        const scoresData = await scoresResponse.json();
        setGames(scoresData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGameScore = (updateData) => {
    setGames(prevGames =>
      prevGames.map(game =>
        game.id === updateData.gameId
          ? {
              ...game,
              home_score: updateData.home_score,
              away_score: updateData.away_score,
              status: updateData.status,
              quarter: updateData.quarter,
              time_remaining: updateData.time_remaining,
              possession: updateData.possession,
              last_updated: new Date().toISOString()
            }
          : game
      )
    );
  };

  const getGameStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-slate-400';
      case 'in_progress': return 'text-green-400 animate-pulse';
      case 'completed': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const formatGameTime = (game) => {
    if (game.status === 'scheduled') {
      return new Date(game.game_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (game.status === 'completed') {
      return 'Final';
    }
    if (game.quarter && game.time_remaining) {
      return `Q${game.quarter} ${game.time_remaining}`;
    }
    return 'Live';
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-black text-4xl md:text-5xl mb-2" style={{
                color: '#fff',
                textShadow: '2px 2px 0 #000, -1px -1px 0 #d4af37, 1px -1px 0 #d4af37, -1px 1px 0 #d4af37, 1px 1px 0 #d4af37',
                fontFamily: 'Impact, "Arial Black", sans-serif',
              }}>LIVE SCORES</h1>
              <p className="text-slate-300 text-lg font-semibold">Real-time game updates • Pool statistics • Live action</p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{
              background: 'rgba(212, 175, 55, 0.1)',
              border: '2px solid rgba(212, 175, 55, 0.3)',
            }}>
              <Activity className="h-5 w-5 text-green-400 animate-pulse" />
              <span className="text-slate-300 font-semibold text-sm">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {games.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pick Distribution Chart */}
          <div className="rounded-xl overflow-hidden" style={{
            background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
            border: '3px solid #d4af37',
            boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
          }}>
            <div className="p-6 border-b-2" style={{
              background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
              borderColor: '#d4af37',
            }}>
              <h2 className="text-2xl font-black text-white flex items-center" style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                fontFamily: 'Impact, sans-serif',
              }}>
                <BarChart3 className="h-6 w-6 mr-2 text-yellow-400" />
                PICK DISTRIBUTION
              </h2>
            </div>
            
            <div className="p-6">
              {stats.pickStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.pickStats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="home_team" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                      stroke="#d4af37"
                    />
                    <YAxis stroke="#d4af37" />
                    <Tooltip 
                      contentStyle={{
                        background: '#1a1f3a',
                        border: '2px solid #d4af37',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value, name) => [
                        value, 
                        name === 'home_picks' ? 'Home Team Picks' : 'Away Team Picks'
                      ]}
                    />
                    <Bar dataKey="home_picks" fill="#3b82f6" name="home_picks" />
                    <Bar dataKey="away_picks" fill="#ef4444" name="away_picks" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-400 py-8 font-semibold">
                  No pick data available
                </div>
              )}
            </div>
          </div>

          {/* Pool Overview */}
          <div className="rounded-xl overflow-hidden" style={{
            background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
            border: '3px solid #d4af37',
            boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
          }}>
            <div className="p-6 border-b-2" style={{
              background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
              borderColor: '#d4af37',
            }}>
              <h2 className="text-2xl font-black text-white flex items-center" style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                fontFamily: 'Impact, sans-serif',
              }}>
                <Users className="h-6 w-6 mr-2 text-yellow-400" />
                POOL OVERVIEW
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-4 rounded-lg" style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '2px solid rgba(212, 175, 55, 0.3)',
              }}>
                <span className="text-slate-300 font-bold uppercase text-sm">Total Participants</span>
                <span className="font-black text-3xl text-yellow-400" style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}>
                  {stats.poolStats.total_participants || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-lg" style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '2px solid rgba(212, 175, 55, 0.3)',
              }}>
                <span className="text-slate-300 font-bold uppercase text-sm">Total Picks Made</span>
                <span className="font-black text-3xl text-green-400" style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}>
                  {stats.poolStats.total_picks || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-lg" style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '2px solid rgba(212, 175, 55, 0.3)',
              }}>
                <span className="text-slate-300 font-bold uppercase text-sm">Average Confidence</span>
                <span className="font-black text-3xl text-blue-400" style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}>
                  {stats.poolStats.avg_confidence ? 
                    parseFloat(stats.poolStats.avg_confidence).toFixed(1) : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Most/Least Picked Teams */}
        <div className="rounded-xl overflow-hidden" style={{
          background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
          border: '3px solid #d4af37',
          boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
        }}>
          <div className="p-6 border-b-2" style={{
            background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
            borderColor: '#d4af37',
          }}>
            <h2 className="text-2xl font-black text-white flex items-center" style={{
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              fontFamily: 'Impact, sans-serif',
            }}>
              <TrendingUp className="h-6 w-6 mr-2 text-yellow-400" />
              TEAM POPULARITY
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Most Picked */}
              <div>
                <h3 className="font-black text-lg text-yellow-400 mb-4 uppercase" style={{
                  fontFamily: '"Arial Black", sans-serif',
                }}>🔥 Most Picked Teams</h3>
                <div className="space-y-3">
                  {stats.pickStats
                    .sort((a, b) => (b.home_picks + b.away_picks) - (a.home_picks + a.away_picks))
                    .slice(0, 5)
                    .map((game, index) => {
                      const totalPicks = (game.home_picks || 0) + (game.away_picks || 0);
                      const mostPickedTeam = (game.home_picks || 0) > (game.away_picks || 0) ? 
                        game.home_team : game.away_team;
                      const mostPicks = Math.max(game.home_picks || 0, game.away_picks || 0);
                      
                      return (
                        <div key={index} className="flex justify-between items-center p-3 rounded-lg" style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '2px solid rgba(16, 185, 129, 0.4)',
                        }}>
                          <span className="font-black text-white">{mostPickedTeam}</span>
                          <span className="text-green-400 font-black text-lg">{mostPicks} picks</span>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              {/* Least Picked */}
              <div>
                <h3 className="font-black text-lg text-yellow-400 mb-4 uppercase" style={{
                  fontFamily: '"Arial Black", sans-serif',
                }}>❄️ Least Picked Teams</h3>
                <div className="space-y-3">
                  {stats.pickStats
                    .sort((a, b) => (a.home_picks + a.away_picks) - (b.home_picks + b.away_picks))
                    .slice(0, 5)
                    .map((game, index) => {
                      const leastPickedTeam = (game.home_picks || 0) < (game.away_picks || 0) ? 
                        game.home_team : game.away_team;
                      const leastPicks = Math.min(game.home_picks || 0, game.away_picks || 0);
                      
                      return (
                        <div key={index} className="flex justify-between items-center p-3 rounded-lg" style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '2px solid rgba(239, 68, 68, 0.4)',
                        }}>
                          <span className="font-black text-white">{leastPickedTeam}</span>
                          <span className="text-red-400 font-black text-lg">{leastPicks} picks</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Game Card Component
function GameCard({ game }) {
  const getScoreDisplay = () => {
    if (game.status === 'scheduled') {
      return (
        <div className="text-center text-slate-300">
          <div className="text-sm font-semibold">
            {new Date(game.game_date).toLocaleDateString()}
          </div>
          <div className="font-bold text-yellow-400">
            {new Date(game.game_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="text-3xl font-black text-yellow-400" style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}>
          {game.away_score || 0} - {game.home_score || 0}
        </div>
        <div className={`text-sm font-bold ${getGameStatusColor(game.status)}`}>
          {formatGameTime(game)}
        </div>
      </div>
    );
  };

  const getGameStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-slate-400';
      case 'in_progress': return 'text-green-400 animate-pulse';
      case 'completed': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const formatGameTime = (game) => {
    if (game.status === 'scheduled') {
      return 'Scheduled';
    }
    if (game.status === 'completed') {
      return 'Final';
    }
    if (game.quarter && game.time_remaining) {
      return `Q${game.quarter} ${game.time_remaining}`;
    }
    return 'Live';
  };

  return (
    <div className="rounded-xl overflow-hidden transition-transform hover:scale-105" style={{
      background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
      border: '3px solid #d4af37',
      boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
    }}>
      <div className="p-5">
        <div className="flex justify-between items-center mb-6">
          <div className="text-right flex-1">
            <div className="font-black text-white text-lg mb-1" style={{
              fontFamily: '"Arial Black", sans-serif',
            }}>{game.away_team}</div>
            <div className="text-xs text-slate-400 font-bold uppercase">Away</div>
          </div>
          
          <div className="px-4">
            {getScoreDisplay()}
          </div>
          
          <div className="text-left flex-1">
            <div className="font-black text-white text-lg mb-1" style={{
              fontFamily: '"Arial Black", sans-serif',
            }}>{game.home_team}</div>
            <div className="text-xs text-slate-400 font-bold uppercase">Home</div>
          </div>
        </div>
        
        {/* Game Details */}
        {game.status === 'in_progress' && (
          <div className="border-t-2 pt-3" style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}>
            {game.possession && (
              <div className="text-center text-sm text-slate-300 mb-2 font-semibold">
                <span className="font-black text-yellow-400">{game.possession}</span> has possession
              </div>
            )}
            
            {game.down_distance && (
              <div className="text-center text-xs text-slate-400 font-semibold">
                {game.down_distance}
              </div>
            )}
            
            {game.field_position && (
              <div className="text-center text-xs text-slate-400 font-semibold">
                at {game.field_position}
              </div>
            )}
            
            {game.last_updated && (
              <div className="text-center text-xs text-slate-500 mt-2">
                Updated: {new Date(game.last_updated).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
        
        {/* Status Indicator */}
        <div className="flex justify-center mt-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase ${
            game.status === 'scheduled' ? 'bg-slate-700 text-slate-300' :
            game.status === 'in_progress' ? 'bg-green-500 text-white' :
            game.status === 'completed' ? 'bg-blue-500 text-white' :
            'bg-slate-700 text-slate-300'
          }`}>
            {game.status === 'in_progress' && (
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            )}
            {game.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default LiveScoresPage;