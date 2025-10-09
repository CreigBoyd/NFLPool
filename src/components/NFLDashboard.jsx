import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Clock, MapPin, Calendar, Trophy, TrendingUp } from 'lucide-react';

// Mock data for demonstration
const generateMockGames = (mode, week) => {
  const teams = [
    { name: 'Kansas City Chiefs', abbreviation: 'KC', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png', color: '#E31837' },
    { name: 'Buffalo Bills', abbreviation: 'BUF', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png', color: '#00338D' },
    { name: 'Dallas Cowboys', abbreviation: 'DAL', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png', color: '#041E42' },
    { name: 'Green Bay Packers', abbreviation: 'GB', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png', color: '#203731' },
    { name: 'San Francisco 49ers', abbreviation: 'SF', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png', color: '#AA0000' },
    { name: 'Philadelphia Eagles', abbreviation: 'PHI', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png', color: '#004C54' },
    { name: 'Miami Dolphins', abbreviation: 'MIA', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png', color: '#008E97' },
    { name: 'Baltimore Ravens', abbreviation: 'BAL', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png', color: '#241773' }
  ];

  const mockGames = [];
  const baseDate = new Date();
  
  for (let i = 0; i < 9; i++) {
    const homeTeam = teams[i % teams.length];
    const awayTeam = teams[(i + 3) % teams.length];

    const gameDate = new Date(baseDate);
    gameDate.setDate(baseDate.getDate() + (mode === 'previous' ? -i - 1 : i + 1));

    const homeScore = mode === 'previous' ? Math.floor(Math.random() * 21) + 14 : null;
    const awayScore = mode === 'previous' ? Math.floor(Math.random() * 21) + 14 : null;

    mockGames.push({
      id: `game-${i}`,
      date: gameDate.toISOString(),
      status: {
        type: {
          name: mode === 'previous' ? 'STATUS_FINAL' : 'STATUS_SCHEDULED'
        }
      },
      competitions: [{
        competitors: [
          {
            homeAway: 'home',
            team: {
              displayName: homeTeam.name,
              abbreviation: homeTeam.abbreviation,
              logo: homeTeam.logo,
              color: homeTeam.color
            },
            score: homeScore,
            winner: mode === 'previous' ? homeScore > awayScore : null
          },
          {
            homeAway: 'away', 
            team: {
              displayName: awayTeam.name,
              abbreviation: awayTeam.abbreviation,
              logo: awayTeam.logo,
              color: awayTeam.color
            },
            score: awayScore,
            winner: mode === 'previous' ? awayScore > homeScore : null
          }
        ],
        venue: {
          fullName: `${homeTeam.name} Stadium`
        }
      }]
    });
  }

  return mockGames;
};

// GameCard Component with FOOTBALL STYLING
function GameCard({ game, isPrevious }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGameStatus = (status) => {
    if (status === 'STATUS_FINAL') return 'FINAL';
    if (status === 'STATUS_IN_PROGRESS') return 'LIVE';
    if (status === 'STATUS_SCHEDULED') return 'SCHEDULED';
    return status;
  };

  const homeTeam = game.competitions[0].competitors.find(team => team.homeAway === 'home');
  const awayTeam = game.competitions[0].competitors.find(team => team.homeAway === 'away');
  
  const status = getGameStatus(game.status.type.name);
  const isLive = status === 'LIVE';
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'LIVE': return { bg: '#dc2626', text: '#fff' };
      case 'FINAL': return { bg: '#3b82f6', text: '#fff' };
      case 'SCHEDULED': return { bg: '#10b981', text: '#fff' };
      default: return { bg: '#6b7280', text: '#fff' };
    }
  };

  const statusColors = getStatusColor(status);
  
  return (
    <div className="rounded-xl overflow-hidden transition-transform hover:scale-105" style={{
      background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
      border: '3px solid #d4af37',
      boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
    }}>
      {/* Card Header - Football Field Green */}
      <div className="p-5 border-b-2" style={{
        background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
        borderColor: '#d4af37',
      }}>
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 text-xs font-black uppercase rounded-full" style={{
            backgroundColor: statusColors.bg,
            color: statusColors.text,
          }}>
            {isLive && <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>}
            {status}
          </span>
          
          <div className="flex items-center text-yellow-400 text-sm font-black uppercase" style={{
            fontFamily: '"Arial Black", sans-serif',
          }}>
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(game.date).split(',')[0]}
          </div>
        </div>
        
        <div className="text-slate-300 text-xs font-semibold">
          {formatDate(game.date)}
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-5">
        {/* Away Team */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b-2" style={{
          borderColor: '#d4af37',
        }}>
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-lg"></div>
              <img 
                src={awayTeam.team.logo} 
                alt={awayTeam.team.displayName}
                className="relative h-12 w-12 object-contain drop-shadow-lg"
              />
            </div>
            <div>
              <p className={`font-black text-base ${awayTeam.winner ? 'text-white' : 'text-slate-300'}`} style={{
                fontFamily: 'Impact, sans-serif',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              }}>
                {awayTeam.team.displayName}
              </p>
              <p className="text-sm text-slate-500 font-bold">{awayTeam.team.abbreviation}</p>
            </div>
            {awayTeam.winner && isPrevious && (
              <Trophy className="h-5 w-5 text-yellow-400" />
            )}
          </div>
          {isPrevious && (
            <div className={`text-4xl font-black tabular-nums ${awayTeam.winner ? 'text-yellow-400' : 'text-slate-600'}`} style={{
              fontFamily: 'Impact, sans-serif',
              textShadow: awayTeam.winner ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
            }}>
              {awayTeam.score || '0'}
            </div>
          )}
        </div>

        {/* Home Team */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-lg"></div>
              <img 
                src={homeTeam.team.logo} 
                alt={homeTeam.team.displayName}
                className="relative h-12 w-12 object-contain drop-shadow-lg"
              />
            </div>
            <div>
              <p className={`font-black text-base ${homeTeam.winner ? 'text-white' : 'text-slate-300'}`} style={{
                fontFamily: 'Impact, sans-serif',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              }}>
                {homeTeam.team.displayName}
              </p>
              <p className="text-sm text-slate-500 font-bold">{homeTeam.team.abbreviation}</p>
            </div>
            {homeTeam.winner && isPrevious && (
              <Trophy className="h-5 w-5 text-yellow-400" />
            )}
          </div>
          {isPrevious && (
            <div className={`text-4xl font-black tabular-nums ${homeTeam.winner ? 'text-yellow-400' : 'text-slate-600'}`} style={{
              fontFamily: 'Impact, sans-serif',
              textShadow: homeTeam.winner ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
            }}>
              {homeTeam.score || '0'}
            </div>
          )}
        </div>

        {/* Venue */}
        {game.competitions[0].venue && (
          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center text-sm text-slate-400">
              <MapPin className="h-4 w-4 mr-2 text-yellow-400" />
              <span className="font-semibold">{game.competitions[0].venue.fullName}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Dashboard Component
function NFLDashboard() {
  const [viewMode, setViewMode] = useState('previous');
  const [currentWeek, setCurrentWeek] = useState(6);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const games = generateMockGames(viewMode, currentWeek);

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const handleWeekChange = (direction) => {
    const newWeek = direction === 'next' ? currentWeek + 1 : currentWeek - 1;
    if (newWeek >= 1 && newWeek <= 18) {
      setCurrentWeek(newWeek);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

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
            }}>NFL DASHBOARD</h1>
            <p className="text-slate-300 text-lg font-semibold">Track scores • Follow your teams • Never miss a game</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold uppercase text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                color: '#000',
                border: '2px solid #000',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
              }}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-10 rounded-3xl shadow-2xl p-6" style={{
          background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
          border: '3px solid #d4af37',
        }}>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* View Mode Toggle */}
            <div className="flex rounded-2xl p-1.5" style={{
              background: 'rgba(212, 175, 55, 0.1)',
            }}>
              {['previous', 'upcoming'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleViewChange(mode)}
                  className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all`}
                  style={{
                    background: viewMode === mode 
                      ? 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)'
                      : 'transparent',
                    color: viewMode === mode ? '#000' : '#d4af37',
                    border: viewMode === mode ? '2px solid #000' : '2px solid transparent',
                    fontFamily: '"Arial Black", sans-serif',
                  }}
                >
                  {mode === 'previous' ? 'Previous' : 'Upcoming'}
                </button>
              ))}
            </div>

            {/* Week Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleWeekChange('prev')}
                disabled={currentWeek <= 1}
                className="p-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
                  color: '#d4af37',
                  border: '2px solid #d4af37',
                }}
              >
                <ArrowLeft className="h-6 w-6" />
              </button>

              <div className="px-8 py-3 rounded-xl shadow-lg" style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                border: '2px solid #000',
              }}>
                <span className="font-black text-2xl tracking-wider" style={{
                  color: '#000',
                  fontFamily: 'Impact, sans-serif',
                }}>
                  WEEK {currentWeek}
                </span>
              </div>

              <button
                onClick={() => handleWeekChange('next')}
                disabled={currentWeek >= 18}
                className="p-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
                  color: '#d4af37',
                  border: '2px solid #d4af37',
                }}
              >
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <div className="text-center py-16 rounded-xl" style={{
            background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
            border: '3px solid #d4af37',
          }}>
            <TrendingUp className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2" style={{
              fontFamily: 'Impact, sans-serif',
            }}>NO GAMES FOUND</h3>
            <p className="text-slate-300 mb-6">Check back soon for more games!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game, index) => (
              <div
                key={game.id}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <GameCard game={game} isPrevious={viewMode === 'previous'} />
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

export default NFLDashboard;