import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle, Lock, AlertTriangle, Trophy, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config/api';

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
        fetch(`${API_BASE_URL}/pools/${poolId}/games`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/picks/${poolId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/pools/${poolId}`, {
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
      return;
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
      return;
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
      const response = await fetch(`${API_BASE_URL}/picks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          poolId: poolId,
          picks: picksArray
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSaved(true);
        setExistingPicks(picksArray);
        setTimeout(() => setSaved(false), 3000);
      } else {
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
      <div className="min-h-screen p-6 flex justify-center items-center" style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400 mx-auto mb-4" style={{
            borderTopColor: '#d4af37',
          }}></div>
          <p className="text-yellow-400 font-bold uppercase">Loading Your Picks...</p>
        </div>
      </div>
    );
  }

  const canSubmit = games.length > 0 && Object.keys(picks).length === games.length;
  const isPoolLocked = pool && new Date() > new Date(pool.start_date);

  return (
    <div className="min-h-screen p-6" style={{
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
    }}>
      <div className="max-w-5xl mx-auto space-y-6">
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
          
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold" style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: '2px solid #000',
              animation: 'pulse 2s ease-in-out'
            }}>
              <CheckCircle className="h-5 w-5" />
              <span>PICKS SAVED!</span>
            </div>
          )}
        </div>

        {/* Pool Info Header */}
        {pool && (
          <div className="rounded-xl overflow-hidden" style={{
            background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
            border: '3px solid #d4af37',
            boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
          }}>
            <div className="p-5 border-b-2" style={{
              background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
              borderColor: '#d4af37',
            }}>
              <h1 className="text-3xl font-black text-white leading-tight mb-2" style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                fontFamily: 'Impact, sans-serif',
              }}>
                {isPoolLocked ? '🔒 YOUR LOCKED PICKS' : '🏈 MAKE YOUR PICKS 🏈'}
              </h1>
              <p className="text-slate-300 font-semibold">
                {isPoolLocked 
                  ? 'Pool has started - picks are locked' 
                  : 'Select the winning team for each game and set your confidence points'}
              </p>
            </div>
            
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <div>
                  <div className="text-slate-400 text-xs font-semibold uppercase">Pool</div>
                  <div className="text-white font-black">{pool.name}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-yellow-400" />
                <div>
                  <div className="text-slate-400 text-xs font-semibold uppercase">Week</div>
                  <div className="text-white font-black">Week {pool.week_number}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-400" />
                <div>
                  <div className="text-slate-400 text-xs font-semibold uppercase">Deadline</div>
                  <div className="text-white font-bold text-sm">{format(new Date(pool.start_date), 'MMM d, h:mm a')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Locked Warning */}
        {isPoolLocked && (
          <div className="rounded-xl p-4" style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            border: '2px solid #000',
            boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
          }}>
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-white" />
              <div>
                <p className="text-white font-black text-sm uppercase">
                  🔒 PICKS ARE LOCKED
                </p>
                <p className="text-red-100 text-xs font-semibold">
                  This pool has already started - You can view your picks but cannot make changes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-xl p-4" style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            border: '2px solid #000',
          }}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-white" />
              <p className="text-white font-bold">{error}</p>
            </div>
          </div>
        )}

        {/* Existing Picks Info */}
        {existingPicks && !isPoolLocked && (
          <div className="rounded-xl p-4" style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: '2px solid #000',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
          }}>
            <p className="text-white font-bold text-sm">
              ✓ You've already submitted picks for this pool. 
              {canEditPicks 
                ? ' You can update them before the pool starts.' 
                : ' Picks are now locked.'}
            </p>
          </div>
        )}

        {/* Games List */}
        <div className="space-y-4">
          {games.map((game, index) => (
            <div
              key={game.id}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
                border: '3px solid #d4af37',
                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Game Header */}
              <div className="p-4 border-b-2 flex items-center justify-between" style={{
                background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
                borderColor: '#d4af37',
              }}>
                <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(game.game_date), 'MMM d, yyyy • h:mm a')}
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="text-yellow-400 text-xs font-black uppercase">Confidence:</label>
                  <select
                    value={picks[game.id]?.confidencePoints || 1}
                    onChange={(e) => handleConfidenceChange(game.id, e.target.value)}
                    disabled={isPoolLocked || (!canEditPicks && existingPicks)}
                    className="rounded font-black px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                      color: '#000',
                      border: '2px solid #000',
                    }}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Team Selection */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handlePickChange(game.id, game.away_team)}
                  disabled={isPoolLocked || (!canEditPicks && existingPicks)}
                  className={`p-5 rounded-lg font-black text-lg transition-all disabled:cursor-not-allowed ${
                    picks[game.id]?.selectedTeam === game.away_team
                      ? 'scale-105'
                      : 'hover:scale-102'
                  }`}
                  style={{
                    background: picks[game.id]?.selectedTeam === game.away_team
                      ? 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)'
                      : 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
                    color: picks[game.id]?.selectedTeam === game.away_team ? '#000' : '#fff',
                    border: picks[game.id]?.selectedTeam === game.away_team
                      ? '3px solid #000'
                      : '2px solid #4b5563',
                    boxShadow: picks[game.id]?.selectedTeam === game.away_team
                      ? '0 6px 20px rgba(212, 175, 55, 0.5)'
                      : 'none',
                    opacity: (isPoolLocked || (!canEditPicks && existingPicks)) ? '0.6' : '1',
                  }}
                >
                  <div className="mb-2" style={{
                    fontFamily: 'Impact, sans-serif',
                    textShadow: picks[game.id]?.selectedTeam === game.away_team 
                      ? '1px 1px 0 rgba(0,0,0,0.3)' 
                      : 'none'
                  }}>
                    {game.away_team}
                  </div>
                  <div className={`text-xs font-semibold uppercase ${
                    picks[game.id]?.selectedTeam === game.away_team ? 'text-gray-700' : 'text-slate-400'
                  }`}>
                    @ {game.home_team}
                  </div>
                  {picks[game.id]?.selectedTeam === game.away_team && (
                    <div className="mt-3 text-2xl">✓</div>
                  )}
                </button>
                
                <button
                  onClick={() => handlePickChange(game.id, game.home_team)}
                  disabled={isPoolLocked || (!canEditPicks && existingPicks)}
                  className={`p-5 rounded-lg font-black text-lg transition-all disabled:cursor-not-allowed ${
                    picks[game.id]?.selectedTeam === game.home_team
                      ? 'scale-105'
                      : 'hover:scale-102'
                  }`}
                  style={{
                    background: picks[game.id]?.selectedTeam === game.home_team
                      ? 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)'
                      : 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
                    color: picks[game.id]?.selectedTeam === game.home_team ? '#000' : '#fff',
                    border: picks[game.id]?.selectedTeam === game.home_team
                      ? '3px solid #000'
                      : '2px solid #4b5563',
                    boxShadow: picks[game.id]?.selectedTeam === game.home_team
                      ? '0 6px 20px rgba(212, 175, 55, 0.5)'
                      : 'none',
                    opacity: (isPoolLocked || (!canEditPicks && existingPicks)) ? '0.6' : '1',
                  }}
                >
                  <div className="mb-2" style={{
                    fontFamily: 'Impact, sans-serif',
                    textShadow: picks[game.id]?.selectedTeam === game.home_team 
                      ? '1px 1px 0 rgba(0,0,0,0.3)' 
                      : 'none'
                  }}>
                    {game.home_team}
                  </div>
                  <div className={`text-xs font-semibold uppercase ${
                    picks[game.id]?.selectedTeam === game.home_team ? 'text-gray-700' : 'text-slate-400'
                  }`}>
                    vs {game.away_team}
                  </div>
                  {picks[game.id]?.selectedTeam === game.home_team && (
                    <div className="mt-3 text-2xl">✓</div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-6">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isPoolLocked || saving || (!canEditPicks && existingPicks)}
            className="w-full py-4 rounded-xl font-black uppercase text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{
              background: (!canSubmit || isPoolLocked || (!canEditPicks && existingPicks))
                ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                : 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
              color: (!canSubmit || isPoolLocked || (!canEditPicks && existingPicks)) ? '#fff' : '#000',
              border: '3px solid #000',
              boxShadow: (!canSubmit || isPoolLocked || (!canEditPicks && existingPicks))
                ? 'none'
                : '0 6px 25px rgba(212, 175, 55, 0.6)',
            }}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-3 border-black"></div>
                SAVING PICKS...
              </>
            ) : isPoolLocked ? (
              <>
                <Lock className="h-5 w-5" />
                PICKS LOCKED
              </>
            ) : existingPicks && !canEditPicks ? (
              <>
                <Lock className="h-5 w-5" />
                PICKS LOCKED
              </>
            ) : existingPicks && canEditPicks ? (
              <>
                <CheckCircle className="h-5 w-5" />
                UPDATE PICKS
              </>
            ) : (
              <>
                🏈 SUBMIT PICKS 🏈
              </>
            )}
          </button>
        </div>
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
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default PicksPage;