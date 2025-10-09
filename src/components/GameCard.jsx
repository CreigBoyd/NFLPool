import React from 'react';
import { Clock, MapPin } from 'lucide-react';

function GameCard({ game, isPrevious = false }) {
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
    if (status === 'STATUS_FINAL') return 'Final';
    if (status === 'STATUS_IN_PROGRESS') return 'Live';
    if (status === 'STATUS_SCHEDULED') return 'Scheduled';
    return status;
  };

  const homeTeam = game.competitions[0].competitors.find(team => team.homeAway === 'home');
  const awayTeam = game.competitions[0].competitors.find(team => team.homeAway === 'away');
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slide-up">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold text-nfl-primary bg-blue-50 px-2 py-1 rounded-full">
            {getGameStatus(game.status.type.name)}
          </span>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {formatDate(game.date)}
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={awayTeam.team.logo} 
                alt={awayTeam.team.displayName}
                className="h-8 w-8 object-contain"
              />
              <div>
                <p className="font-semibold text-gray-900">{awayTeam.team.displayName}</p>
                <p className="text-sm text-gray-500">{awayTeam.team.abbreviation}</p>
              </div>
            </div>
            {isPrevious && (
              <span className="text-2xl font-bold text-gray-900">
                {awayTeam.score || '0'}
              </span>
            )}
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={homeTeam.team.logo} 
                alt={homeTeam.team.displayName}
                className="h-8 w-8 object-contain"
              />
              <div>
                <p className="font-semibold text-gray-900">{homeTeam.team.displayName}</p>
                <p className="text-sm text-gray-500">{homeTeam.team.abbreviation}</p>
              </div>
            </div>
            {isPrevious && (
              <span className="text-2xl font-bold text-gray-900">
                {homeTeam.score || '0'}
              </span>
            )}
          </div>
        </div>

        {game.competitions[0].venue && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              {game.competitions[0].venue.fullName}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameCard;
