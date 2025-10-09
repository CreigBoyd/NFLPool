import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

function PicksPage() {
  const { poolId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [games, setGames] = useState([]);
  const [picks, setPicks] = useState({});
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const [canEditPicks, setCanEditPicks] = useState(false);
  const [existingPicks, setExistingPicks] = useState(null);

  useEffect(() => {
    fetchGamesAndPicks();
  }, [poolId]);

  const fetchGamesAndPicks = async () => {
    try {
      const [gamesResponse, picksResponse, poolResponse] = await Promise.all([
        fetch(`/api/pools/${poolId}/games`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/picks/${poolId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/pools/${poolId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (gamesResponse.ok) {
        const gamesData = await gamesResponse.json();
        setGames(gamesData);
      }
      
      if (picksResponse.ok) {
        const picksData = await picksResponse.json();
        const picksMap = {};
        picksData.forEach(pick => {
          picksMap[pick.game_id] = {
            selectedTeam: pick.selected_team,
            confidencePoints: pick.confidence_points
          };
        });
        setPicks(picksMap);
        if (picksData.length > 0) {
          setExistingPicks(picksData);
        }
      }

      if (poolResponse.ok) {
        const poolData = await poolResponse.json();
        setPool(poolData);
        // Check if picks can be edited
        setCanEditPicks(new Date() < new Date(poolData.start_date));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load pool data');
    } finally {
      setLoading(false);
    }
  };

  const handlePickChange = (gameId, team) => {
    if (!canEditPicks && existingPicks) {
      return; // Don't allow changes if locked
    }
    
    setPicks(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        selectedTeam: team
      }
    }));
  };

  const handleConfidenceChange = (gameId, points) => {
    if (!canEditPicks && existingPicks) {
      return; // Don't allow changes if locked
    }
    
    setPicks(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        confidencePoints: parseInt(points)
      }
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    
    const picksArray = Object.entries(picks).map(([gameId, pick]) => ({
      gameId: parseInt(gameId),
      selectedTeam: pick.selectedTeam,
      confidencePoints: pick.confidencePoints || 1
    }));
    
    try {
      const response = await fetch('/api/picks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          poolId: poolId,  // Send as string
          picks: picksArray
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSaved(true);
        setExistingPicks(picksArray);
        setTimeout(() => setSaved(false), 3000);
      } else {
        // Handle different error types
        if (data.errorCode === 'POOL_LOCKED') {
          setError('⏰ Pool has already started - picks are locked!');
        } else if (data.errorCode === 'INVALID_PICKS') {
          setError('❌ Please select a team for all games');
        } else if (data.errorCode === 'POOL_COMPLETED') {
          setError('🏁 This pool has already ended - picks cannot be changed');
        } else {
          setError('❌ ' + data.error);
        }
      }
    } catch (error) {
      console.error('Error saving picks:', error);
      setError('❌ Network error - failed to save picks');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const canSubmit = games.length > 0 && Object.keys(picks).length === games.length;
  const isPoolLocked = pool && new Date() > new Date(pool.start_date);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/pools')}
          className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Pools</span>
        </button>
        
        {saved && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Picks saved!</span>
          </div>
        )}
      </div>

      {/* Pool Locked Warning */}
      {isPoolLocked && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <Lock className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-700 font-semibold">
                🔒 Picks are locked - This pool has already started
              </p>
              <p className="text-xs text-red-600 mt-1">
                You can view your picks but cannot make changes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="ml-3 text-sm text-red-700 font-semibold">{error}</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {isPoolLocked ? 'Your Picks' : 'Make Your Picks'}
        </h1>
        <p className="text-neutral-600">
          {isPoolLocked 
            ? 'Pool has started - picks are locked' 
            : 'Select the winning team for each game'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6">
          <div className="space-y-4">
            {games.map((game) => (
              <div key={game.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-neutral-600">
                    {format(new Date(game.game_date), 'MMM d, yyyy h:mm a')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-neutral-600">Confidence:</label>
                    <select
                      value={picks[game.id]?.confidencePoints || 1}
                      onChange={(e) => handleConfidenceChange(game.id, e.target.value)}
                      disabled={isPoolLocked || (!canEditPicks && existingPicks)}
                      className="border border-neutral-300 rounded px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePickChange(game.id, game.away_team)}
                    disabled={isPoolLocked || (!canEditPicks && existingPicks)}
                    className={`p-4 rounded-lg border-2 transition-all disabled:cursor-not-allowed ${
                      picks[game.id]?.selectedTeam === game.away_team
                        ? 'border-primary-500 bg-primary-50 text-primary-900'
                        : 'border-neutral-200 hover:border-primary-300'
                    } ${(isPoolLocked || (!canEditPicks && existingPicks)) ? 'opacity-60' : ''}`}
                  >
                    <div className="font-semibold">{game.away_team}</div>
                    <div className="text-sm text-neutral-600">@ {game.home_team}</div>
                  </button>
                  
                  <button
                    onClick={() => handlePickChange(game.id, game.home_team)}
                    disabled={isPoolLocked || (!canEditPicks && existingPicks)}
                    className={`p-4 rounded-lg border-2 transition-all disabled:cursor-not-allowed ${
                      picks[game.id]?.selectedTeam === game.home_team
                        ? 'border-primary-500 bg-primary-50 text-primary-900'
                        : 'border-neutral-200 hover:border-primary-300'
                    } ${(isPoolLocked || (!canEditPicks && existingPicks)) ? 'opacity-60' : ''}`}
                  >
                    <div className="font-semibold">{game.home_team}</div>
                    <div className="text-sm text-neutral-600">vs {game.away_team}</div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 pt-0 space-y-3">
          {existingPicks && !isPoolLocked && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-700 text-sm font-semibold">
                ✓ You've already submitted picks for this pool. 
                {canEditPicks 
                  ? ' You can update them before the pool starts.' 
                  : ' Picks are now locked.'}
              </p>
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isPoolLocked || saving || (!canEditPicks && existingPicks)}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : isPoolLocked ? (
              <>
                <Lock className="h-4 w-4" />
                Picks Locked
              </>
            ) : existingPicks && !canEditPicks ? (
              <>
                <Lock className="h-4 w-4" />
                Picks Locked
              </>
            ) : existingPicks && canEditPicks ? (
              'Update Picks'
            ) : (
              'Submit Picks'
            )}
          </button>
          
          {pool && (
            <p className="text-sm text-neutral-500 text-center">
              Deadline: {new Date(pool.start_date).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PicksPage;