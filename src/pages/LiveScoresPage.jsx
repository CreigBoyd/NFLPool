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
      case 'scheduled': return 'text-neutral-600';
      case 'in_progress': return 'text-green-600 animate-pulse';
      case 'completed': return 'text-blue-600';
      default: return 'text-neutral-600';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Scores & Stats</h1>
          <p className="text-neutral-600">Real-time game updates and pool statistics</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-neutral-600">
          <Activity className="h-4 w-4" />
          <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

 

      {/* Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pick Distribution Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Pick Distribution
          </h2>
          
          {stats.pickStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.pickStats.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="home_team" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
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
            <div className="text-center text-neutral-500 py-8">
              No pick data available
            </div>
          )}
        </div>

        {/* Pool Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Pool Overview
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
              <span className="text-neutral-700">Total Participants</span>
              <span className="font-bold text-2xl text-primary-600">
                {stats.poolStats.total_participants || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
              <span className="text-neutral-700">Total Picks Made</span>
              <span className="font-bold text-2xl text-green-600">
                {stats.poolStats.total_picks || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
              <span className="text-neutral-700">Average Confidence</span>
              <span className="font-bold text-2xl text-neutral-900">
                {stats.poolStats.avg_confidence ? 
                  parseFloat(stats.poolStats.avg_confidence).toFixed(1) : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Most/Least Picked Teams */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Team Popularity
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Most Picked */}
          <div>
            <h3 className="font-medium text-neutral-900 mb-3">Most Picked Teams</h3>
            <div className="space-y-2">
              {stats.pickStats
                .sort((a, b) => (b.home_picks + b.away_picks) - (a.home_picks + a.away_picks))
                .slice(0, 5)
                .map((game, index) => {
                  const totalPicks = (game.home_picks || 0) + (game.away_picks || 0);
                  const mostPickedTeam = (game.home_picks || 0) > (game.away_picks || 0) ? 
                    game.home_team : game.away_team;
                  const mostPicks = Math.max(game.home_picks || 0, game.away_picks || 0);
                  
                  return (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">{mostPickedTeam}</span>
                      <span className="text-green-600 font-bold">{mostPicks} picks</span>
                    </div>
                  );
                })}
            </div>
          </div>
          
          {/* Least Picked */}
          <div>
            <h3 className="font-medium text-neutral-900 mb-3">Least Picked Teams</h3>
            <div className="space-y-2">
              {stats.pickStats
                .sort((a, b) => (a.home_picks + a.away_picks) - (b.home_picks + b.away_picks))
                .slice(0, 5)
                .map((game, index) => {
                  const leastPickedTeam = (game.home_picks || 0) < (game.away_picks || 0) ? 
                    game.home_team : game.away_team;
                  const leastPicks = Math.min(game.home_picks || 0, game.away_picks || 0);
                  
                  return (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">{leastPickedTeam}</span>
                      <span className="text-red-600 font-bold">{leastPicks} picks</span>
                    </div>
                  );
                })}
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
        <div className="text-center text-neutral-600">
          <div className="text-sm">
            {new Date(game.game_date).toLocaleDateString()}
          </div>
          <div className="font-medium">
            {new Date(game.game_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="text-2xl font-bold text-neutral-900">
          {game.away_score || 0} - {game.home_score || 0}
        </div>
        <div className={`text-sm font-medium ${getGameStatusColor(game.status)}`}>
          {formatGameTime(game)}
        </div>
      </div>
    );
  };

  const getGameStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-neutral-600';
      case 'in_progress': return 'text-green-600 animate-pulse';
      case 'completed': return 'text-blue-600';
      default: return 'text-neutral-600';
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
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-right">
          <div className="font-semibold text-neutral-900">{game.away_team}</div>
          <div className="text-sm text-neutral-600">Away</div>
        </div>
        
        {getScoreDisplay()}
        
        <div className="text-left">
          <div className="font-semibold text-neutral-900">{game.home_team}</div>
          <div className="text-sm text-neutral-600">Home</div>
        </div>
      </div>
      
      {/* Game Details */}
      {game.status === 'in_progress' && (
        <div className="border-t border-neutral-200 pt-3">
          {game.possession && (
            <div className="text-center text-sm text-neutral-600 mb-1">
              <span className="font-medium">{game.possession}</span> has possession
            </div>
          )}
          
          {game.down_distance && (
            <div className="text-center text-xs text-neutral-500">
              {game.down_distance}
            </div>
          )}
          
          {game.field_position && (
            <div className="text-center text-xs text-neutral-500">
              at {game.field_position}
            </div>
          )}
          
          {game.last_updated && (
            <div className="text-center text-xs text-neutral-400 mt-2">
              Updated: {new Date(game.last_updated).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
      
      {/* Status Indicator */}
      <div className="flex justify-center mt-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          game.status === 'scheduled' ? 'bg-neutral-100 text-neutral-800' :
          game.status === 'in_progress' ? 'bg-green-100 text-green-800' :
          game.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-neutral-100 text-neutral-800'
        }`}>
          {game.status === 'in_progress' && (
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
          )}
          {game.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default LiveScoresPage;