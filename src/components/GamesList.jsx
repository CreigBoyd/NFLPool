import React from 'react';
import GameCard from './GameCard';
import { Loader2 } from 'lucide-react';

function GamesList({ games, loading, isPrevious, error }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-nfl-primary" />
        <span className="ml-2 text-lg text-gray-600">Loading games...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 font-semibold">Error loading games</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">No games found for this period.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {games.map((game, index) => (
        <GameCard 
          key={game.id || index} 
          game={game} 
          isPrevious={isPrevious}
        />
      ))}
    </div>
  );
}

export default GamesList;
