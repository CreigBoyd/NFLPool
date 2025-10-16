import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Users, Clock, DollarSign, Lock, Unlock, Copy, Check, TrendingUp, Award, X, AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config/api';

function SideBetsPage() {
  const { token } = useAuth();
  const [sideBets, setSideBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedBetForResults, setSelectedBetForResults] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSideBets();
  }, [activeTab]);

  const fetchSideBets = async () => {
    setLoading(true);
    setError('');
    try {
      const statusParam = activeTab === 'all' ? '' : `?status=${encodeURIComponent(activeTab)}`;
      const response = await fetch(`${API_BASE_URL}/side-bets${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSideBets(data);
      } else {
        setError('Failed to load side bets');
      }
    } catch (err) {
      console.error('Error fetching side bets:', err);
      setError('Network error loading side bets');
    } finally {
      setLoading(false);
    }
  };

  const joinSideBetByCode = async () => {
    if (inviteCode.length !== 6) {
      alert('Please enter a 6-character invite code');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/side-bets/join-by-code`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invite_code: inviteCode }),
      });
      
      if (response.ok) {
        alert('Successfully joined side bet!');
        setShowJoinModal(false);
        setInviteCode('');
        fetchSideBets();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join side bet');
      }
    } catch (error) {
      console.error('Error joining side bet:', error);
      alert('Network error - failed to join side bet');
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const viewResults = async (bet) => {
    try {
      const response = await fetch(`${API_BASE_URL}/side-bets/${bet.id}/results`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedBetForResults(data);
        setShowResultsModal(true);
      } else {
        alert('Failed to load results');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Failed to load results');
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
          <p className="text-yellow-400 font-bold uppercase">Loading Side Bets...</p>
        </div>
      </div>
    );
  }

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
            }}>SIDE BETS</h1>
            <p className="text-slate-300 text-lg font-semibold">Challenge your crew • Put your money where your mouth is</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold uppercase text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)',
                color: '#d4af37',
                border: '2px solid #d4af37',
              }}
            >
              <Users className="h-5 w-5" />
              <span>Join with Code</span>
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold uppercase text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                color: '#000',
                border: '2px solid #000',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
              }}
            >
              <Plus className="h-5 w-5" />
              <span>Create Bet</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl p-4 mb-6" style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            border: '2px solid #000',
          }}>
            <p className="text-white font-bold text-center">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b-2 border-slate-700">
          <nav className="flex gap-2">
            {[
              { key: 'all', label: 'All Bets' },
              { key: 'open', label: 'Open' },
              { key: 'closed', label: 'Closed' },
              { key: 'settled', label: 'Settled' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 font-bold uppercase text-sm transition-all ${
                  activeTab === tab.key
                    ? 'border-b-4 border-yellow-400 text-yellow-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{
                  fontFamily: '"Arial Black", sans-serif',
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Side Bets Grid */}
      <div className="max-w-7xl mx-auto">
        {sideBets.length === 0 ? (
          <div className="text-center py-16 rounded-xl" style={{
            background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
            border: '3px solid #d4af37',
          }}>
            <DollarSign className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2" style={{
              fontFamily: 'Impact, sans-serif',
            }}>NO BETS FOUND</h3>
            <p className="text-slate-300 mb-6">Time to make some money!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-lg font-bold uppercase"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                color: '#000',
                border: '2px solid #000',
              }}
            >
              Create Your First Bet
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sideBets.map((bet, index) => (
              <div
                key={bet.id}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <SideBetCard
                  bet={bet}
                  onCopyCode={copyInviteCode}
                  copiedCode={copiedCode}
                  onRefresh={fetchSideBets}
                  onViewResults={viewResults}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateSideBetModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchSideBets}
        />
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50" style={{
          backdropFilter: 'blur(4px)',
        }}>
          <div className="rounded-xl w-full max-w-md overflow-hidden" style={{
            background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
            border: '3px solid #d4af37',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          }}>
            <div className="p-6 border-b-2" style={{
              background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
              borderColor: '#d4af37',
            }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white" style={{
                  textShadow: '2px 2px 0 #000',
                  fontFamily: 'Impact, sans-serif',
                }}>JOIN WITH CODE</h2>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="p-2 rounded-lg transition-all"
                  style={{
                    background: 'rgba(220, 38, 38, 0.8)',
                    color: '#fff',
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <label className="block text-yellow-400 text-sm font-black uppercase mb-3">
                Enter 6-Character Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-4 rounded-lg font-black text-2xl text-white text-center placeholder-slate-500 tracking-widest"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '2px solid #d4af37',
                }}
              />
            </div>

            <div className="p-6 border-t-2" style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#d4af37',
            }}>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setInviteCode('');
                  }}
                  className="flex-1 py-3 rounded-lg font-black uppercase text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    color: '#fff',
                    border: '2px solid #374151',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={joinSideBetByCode}
                  disabled={inviteCode.length !== 6}
                  className="flex-1 py-3 rounded-lg font-black uppercase text-sm transition-all disabled:opacity-50"
                  style={{
                    background: inviteCode.length === 6
                      ? 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)'
                      : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    color: inviteCode.length === 6 ? '#000' : '#fff',
                    border: '2px solid #000',
                    boxShadow: inviteCode.length === 6 ? '0 4px 15px rgba(212, 175, 55, 0.4)' : 'none',
                  }}
                >
                  Join Bet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResultsModal && selectedBetForResults && (
        <ResultsModal
          results={selectedBetForResults}
          onClose={() => {
            setShowResultsModal(false);
            setSelectedBetForResults(null);
          }}
        />
      )}

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

// Side Bet Card Component
function SideBetCard({ bet, onCopyCode, copiedCode, onRefresh, onViewResults }) {
  const { token } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const joinSideBet = async (optionId = null, predictionValue = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/side-bets/${bet.id}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selected_option_id: optionId,
          prediction_value: predictionValue
        })
      });
      if (response.ok) {
        alert('Successfully joined side bet!');
        onRefresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join side bet');
      }
    } catch (error) {
      console.error('Error joining side bet:', error);
      alert('Network error - failed to join side bet');
    }
  };

  const timeUntilDeadline = () => {
    const now = new Date();
    const deadline = new Date(bet.deadline);
    const diff = deadline - now;
    
    if (diff <= 0) return 'EXPIRED';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}D ${hours % 24}H`;
    }
    
    return `${hours}H ${minutes}M`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return { bg: '#10b981', text: '#fff' };
      case 'closed': return { bg: '#f59e0b', text: '#000' };
      case 'settled': return { bg: '#3b82f6', text: '#fff' };
      default: return { bg: '#6b7280', text: '#fff' };
    }
  };

  const statusColors = getStatusColor(bet.status);

  return (
    <div className="rounded-xl overflow-hidden transition-transform hover:scale-105" style={{
      background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
      border: '3px solid #d4af37',
      boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
    }}>
      <div className="p-5 border-b-2" style={{
        background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
        borderColor: '#d4af37',
      }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {bet.is_private ? (
              <Lock className="h-5 w-5 text-yellow-400" />
            ) : (
              <Unlock className="h-5 w-5 text-green-400" />
            )}
            <span className="px-3 py-1 text-xs font-black uppercase rounded-full" style={{
              backgroundColor: statusColors.bg,
              color: statusColors.text,
            }}>
              {bet.status}
            </span>
          </div>
          
          <div className="flex items-center text-yellow-400 text-sm font-black uppercase" style={{
            fontFamily: '"Arial Black", sans-serif',
          }}>
            <Clock className="h-4 w-4 mr-1" />
            {timeUntilDeadline()}
          </div>
        </div>
        
        <h3 className="text-xl font-black text-white leading-tight" style={{
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          fontFamily: 'Impact, sans-serif',
        }}>{bet.title}</h3>
      </div>
      
      <div className="p-5">
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{bet.description}</p>
        
        <div className="space-y-3 mb-5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm font-semibold uppercase">Creator:</span>
            <span className="font-black text-yellow-400">{bet.creator_name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm font-semibold uppercase">Players:</span>
            <span className="font-black text-white">
              {bet.participant_count}{bet.max_participants ? `/${bet.max_participants}` : ''}
            </span>
          </div>
          
          {bet.entry_fee > 0 && (
            <div className="flex justify-between items-center p-2 rounded" style={{
              background: 'rgba(212, 175, 55, 0.1)',
            }}>
              <span className="text-yellow-400 text-sm font-semibold uppercase">Entry Fee:</span>
              <span className="font-black text-green-400 text-lg">${bet.entry_fee}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm font-semibold uppercase">Deadline:</span>
            <span className="font-bold text-white text-xs">{format(new Date(bet.deadline), 'MMM d, h:mm a')}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {!bet.user_participating && bet.status === 'open' && (
            <button
              onClick={() => setShowDetails(true)}
              className="w-full py-3 rounded-lg font-black uppercase text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                color: '#000',
                border: '2px solid #000',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
              }}
            >
              🏈 JOIN BET 🏈
            </button>
          )}
          
          {bet.user_participating && bet.status !== 'settled' && (
            <div className="w-full py-3 rounded-lg font-black uppercase text-sm text-center" style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: '2px solid #065f46',
            }}>
              ✓ YOU'RE IN
            </div>
          )}
          
          {bet.status === 'settled' && (
            <button
              onClick={() => onViewResults(bet)}
              className="w-full py-3 rounded-lg font-black uppercase text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                border: '2px solid #1e40af',
              }}
            >
              <Award className="h-5 w-5" />
              <span>VIEW RESULTS</span>
            </button>
          )}
          
          {bet.is_private && bet.invite_code && bet.is_creator && (
            <div className="p-4 rounded-lg" style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(184, 148, 31, 0.15) 100%)',
              border: '2px solid #d4af37',
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-400 font-black uppercase mb-1">Invite Code</p>
                  <p className="text-2xl font-black text-white tracking-widest">{bet.invite_code}</p>
                </div>
                <button
                  onClick={() => onCopyCode(bet.invite_code)}
                  className="p-3 rounded-lg transition-colors"
                  style={{
                    background: copiedCode === bet.invite_code ? '#10b981' : '#d4af37',
                  }}
                >
                  {copiedCode === bet.invite_code ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <Copy className="h-5 w-5 text-black" />
                  )}
                </button>
              </div>
              <p className="text-xs text-yellow-300 mt-2 font-semibold">Share with your crew</p>
            </div>
          )}
        </div>
      </div>
      
      {showDetails && (
        <SideBetDetailsModal
          bet={bet}
          onClose={() => setShowDetails(false)}
          onJoin={joinSideBet}
        />
      )}
    </div>
  );
}

// Side Bet Details Modal Component
function SideBetDetailsModal({ bet, onClose, onJoin }) {
  const { token } = useAuth();
  const [selectedOption, setSelectedOption] = useState(null);
  const [predictionValue, setPredictionValue] = useState('');
  const [betDetails, setBetDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBetDetails();
  }, []);

  const fetchBetDetails = async (retries = 3) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/side-bets/${bet.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setBetDetails(data);
    } catch (error) {
      console.error('Error fetching bet details:', error);
      
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        setTimeout(() => fetchBetDetails(retries - 1), 1000);
      } else {
        alert('Failed to load bet details after multiple attempts');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if ((betDetails.bet_type === 'multiple_choice' || betDetails.bet_type === 'binary') && !selectedOption) {
      alert('Please select an option');
      return;
    }
    
    if ((betDetails.bet_type === 'prediction' || betDetails.bet_type === 'over_under') && !predictionValue) {
      alert('Please enter a prediction value');
      return;
    }
    
    onJoin(selectedOption, predictionValue);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
        <div className="rounded-xl p-8" style={{
          background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
          border: '3px solid #d4af37',
        }}>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!betDetails) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50" style={{
      backdropFilter: 'blur(4px)',
    }}>
      <div className="rounded-xl w-full max-w-md overflow-hidden max-h-[90vh]" style={{
        background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
        border: '3px solid #d4af37',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
      }}>
        <div className="p-6 border-b-2" style={{
          background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
          borderColor: '#d4af37',
        }}>
          <h2 className="text-2xl font-black text-white" style={{
            textShadow: '2px 2px 0 #000',
            fontFamily: 'Impact, sans-serif',
          }}>{betDetails.title}</h2>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <p className="text-slate-300 font-semibold mb-6">{betDetails.description}</p>
          
          {(betDetails.bet_type === 'multiple_choice' || betDetails.bet_type === 'binary') && betDetails.options && (
            <div className="space-y-3 mb-6">
              <h3 className="font-black text-yellow-400 uppercase text-sm">Select your choice:</h3>
              <div className="space-y-2">
                {betDetails.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className="w-full p-4 rounded-lg text-left transition-all font-bold"
                    style={{
                      background: selectedOption === option.id
                        ? 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)'
                        : 'rgba(0, 0, 0, 0.4)',
                      border: selectedOption === option.id ? '2px solid #000' : '2px solid #4b5563',
                      color: selectedOption === option.id ? '#000' : '#fff',
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span>{option.option_text}</span>
                      {option.odds && (
                        <span className="text-sm">Odds: {option.odds}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {(betDetails.bet_type === 'prediction' || betDetails.bet_type === 'over_under') && (
            <div className="mb-6">
              <label className="block text-yellow-400 text-sm font-black uppercase mb-2">
                Your Prediction
              </label>
              <input
                type="number"
                value={predictionValue}
                onChange={(e) => setPredictionValue(e.target.value)}
                className="w-full px-4 py-3 rounded-lg font-semibold text-white placeholder-slate-500"
                placeholder="Enter your prediction"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '2px solid #4b5563',
                }}
              />
            </div>
          )}
          
          {betDetails.entry_fee > 0 && (
            <div className="rounded-lg p-4 mb-4" style={{
              background: 'rgba(245, 158, 11, 0.2)',
              border: '2px solid #f59e0b',
            }}>
              <p className="text-yellow-400 font-bold">
                <strong>Entry Fee:</strong> ${betDetails.entry_fee}
              </p>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t-2" style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderColor: '#d4af37',
        }}>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-black uppercase text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: '#fff',
                border: '2px solid #374151',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              className="flex-1 py-3 rounded-lg font-black uppercase text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                color: '#000',
                border: '2px solid #000',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
              }}
            >
              Join Bet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Results Modal Component
function ResultsModal({ results, onClose }) {
  const { sideBet, winners } = results;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50" style={{
      backdropFilter: 'blur(4px)',
    }}>
      <div className="rounded-xl w-full max-w-2xl overflow-hidden max-h-[90vh]" style={{
        background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
        border: '3px solid #d4af37',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
      }}>
        <div className="p-6 border-b-2" style={{
          background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
          borderColor: '#d4af37',
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-400" />
              <h2 className="text-2xl font-black text-white" style={{
                textShadow: '2px 2px 0 #000',
                fontFamily: 'Impact, sans-serif',
              }}>BET RESULTS</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all"
              style={{
                background: 'rgba(220, 38, 38, 0.8)',
                color: '#fff',
              }}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="rounded-lg p-6 mb-6" style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
            border: '2px solid #3b82f6',
          }}>
            <h3 className="text-xl font-black text-white mb-2" style={{
              fontFamily: 'Impact, sans-serif',
            }}>{sideBet.title}</h3>
            <p className="text-slate-300 font-semibold mb-4">{sideBet.description}</p>
            
            {sideBet.winning_option && (
              <div className="rounded-lg p-4 mb-4" style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid #10b981',
              }}>
                <p className="text-sm text-slate-300 font-semibold mb-1">Winning Option:</p>
                <p className="text-lg font-black text-green-400">{sideBet.winning_option.option_text}</p>
              </div>
            )}
            
            {sideBet.actual_result && (
              <div className="rounded-lg p-4" style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid #10b981',
              }}>
                <p className="text-sm text-slate-300 font-semibold mb-1">Final Result:</p>
                <p className="text-lg font-black text-green-400">{sideBet.actual_result}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-black text-yellow-400 mb-4 flex items-center uppercase" style={{
              fontFamily: 'Impact, sans-serif',
            }}>
              <Award className="h-6 w-6 mr-2" />
              Winners ({winners.length})
            </h3>
            
            {winners.length === 0 ? (
              <div className="text-center py-8 rounded-lg" style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '2px solid #4b5563',
              }}>
                <p className="text-slate-400 font-semibold">No winners for this bet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {winners.map((winner, index) => {
                  const getRankStyle = (rank) => {
                    switch (rank) {
                      case 0:
                        return { bg: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)', color: '#000', badge: '#fbbf24' };
                      case 1:
                        return { bg: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)', color: '#000', badge: '#d1d5db' };
                      case 2:
                        return { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#000', badge: '#f59e0b' };
                      default:
                        return { bg: 'linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)', color: '#fff', badge: '#3b82f6' };
                    }
                  };
                  
                  const rankStyle = getRankStyle(index);
                  
                  return (
                    <div
                      key={winner.id}
                      className="flex items-center justify-between rounded-lg p-4"
                      style={{
                        background: rankStyle.bg,
                        border: '2px solid #000',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg" style={{
                          background: rankStyle.badge,
                          color: '#000',
                          border: '2px solid #000',
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-black" style={{ color: rankStyle.color }}>{winner.username}</p>
                          {winner.option_text && (
                            <p className="text-sm font-semibold opacity-80" style={{ color: rankStyle.color }}>
                              Selected: {winner.option_text}
                            </p>
                          )}
                          {winner.prediction_value && (
                            <p className="text-sm font-semibold opacity-80" style={{ color: rankStyle.color }}>
                              Predicted: {winner.prediction_value}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-green-400">
                          ${parseFloat(winner.potential_payout).toFixed(2)}
                        </p>
                        <p className="text-xs font-bold opacity-80" style={{ color: rankStyle.color }}>PAYOUT</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t-2" style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderColor: '#d4af37',
        }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg font-black uppercase text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: '#fff',
              border: '2px solid #374151',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Side Bet Modal Component
function CreateSideBetModal({ onClose, onSuccess }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bet_type: 'multiple_choice',
    deadline: '',
    entry_fee: 0,
    max_participants: '',
    is_private: false,
    options: ['', '']
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const handleCreate = async () => {
    setError('');
    
    if (!formData.title || !formData.description || !formData.deadline) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(formData.deadline) <= new Date()) {
      setError('Deadline must be in the future');
      return;
    }

    if ((formData.bet_type === 'multiple_choice' || formData.bet_type === 'binary')) {
      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setError('Please provide at least 2 options');
        return;
      }
    }

    setCreating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/side-bets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          options: (formData.bet_type === 'multiple_choice' || formData.bet_type === 'binary')
            ? formData.options.filter(opt => opt.trim()).map(opt => ({ text: opt }))
            : undefined
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Side bet created successfully! ${formData.is_private ? `Invite code: ${result.invite_code}` : ''}`);
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create side bet');
      }
    } catch (error) {
      console.error('Error creating side bet:', error);
      setError('Network error - failed to create side bet');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50" style={{
      backdropFilter: 'blur(4px)',
    }}>
      <div className="rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden" style={{
        background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
        border: '3px solid #d4af37',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
      }}>
        <div className="p-6 border-b-2" style={{
          background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
          borderColor: '#d4af37',
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-yellow-400" />
              <h2 className="text-3xl font-black text-white" style={{
                textShadow: '2px 2px 0 #000',
                fontFamily: 'Impact, sans-serif',
              }}>CREATE SIDE BET</h2>
            </div>
            <button
              onClick={onClose}
              disabled={creating}
              className="p-2 rounded-lg transition-all disabled:opacity-50"
              style={{
                background: 'rgba(220, 38, 38, 0.8)',
                color: '#fff',
              }}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {error && (
            <div className="mb-6 rounded-xl p-4 flex items-center gap-3" style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              border: '2px solid #000',
            }}>
              <AlertTriangle className="h-5 w-5 text-white flex-shrink-0" />
              <p className="text-white font-bold text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-yellow-400 text-sm font-black uppercase mb-2">
                Bet Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Who will score first touchdown?"
                disabled={creating}
                className="w-full px-4 py-3 rounded-lg font-semibold text-white placeholder-slate-500 disabled:opacity-50"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '2px solid #4b5563',
                }}
              />
            </div>

            <div>
              <label className="block text-yellow-400 text-sm font-black uppercase mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide more details about the bet..."
                rows={3}
                disabled={creating}
                className="w-full px-4 py-3 rounded-lg font-semibold text-white placeholder-slate-500 disabled:opacity-50"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '2px solid #4b5563',
                }}
              />
            </div>

            <div>
              <label className="block text-yellow-400 text-sm font-black uppercase mb-2">
                Bet Type
              </label>
              <select
                value={formData.bet_type}
                onChange={(e) => handleInputChange('bet_type', e.target.value)}
                disabled={creating}
                className="w-full px-4 py-3 rounded-lg font-bold text-white disabled:opacity-50"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '2px solid #4b5563',
                }}
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="binary">Yes/No (Binary)</option>
                <option value="prediction">Prediction (Number)</option>
                <option value="over_under">Over/Under</option>
              </select>
            </div>

            {(formData.bet_type === 'multiple_choice' || formData.bet_type === 'binary') && (
              <div className="rounded-xl p-5" style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '2px solid rgba(212, 175, 55, 0.3)',
              }}>
                <label className="block text-yellow-400 text-sm font-black uppercase mb-3">
                  Options * (Minimum 2)
                </label>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        disabled={creating}
                        className="flex-1 px-4 py-3 rounded-lg font-semibold text-white placeholder-slate-500 disabled:opacity-50"
                        style={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '2px solid #4b5563',
                        }}
                      />
                      {formData.options.length > 2 && !creating && (
                        <button
                          onClick={() => removeOption(index)}
                          className="px-4 py-3 rounded-lg font-bold transition-all"
                          style={{
                            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                            color: '#fff',
                            border: '2px solid #7f1d1d',
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {!creating && (
                    <button
                      onClick={addOption}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                        color: '#000',
                        border: '2px solid #000',
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Option
                    </button>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-yellow-400 text-sm font-black uppercase mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Deadline *
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                disabled={creating}
                className="w-full px-4 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '2px solid #4b5563',
                  colorScheme: 'dark',
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-yellow-400 text-sm font-black uppercase mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Entry Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.entry_fee}
                  onChange={(e) => handleInputChange('entry_fee', parseFloat(e.target.value) || 0)}
                  disabled={creating}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '2px solid #4b5563',
                  }}
                />
              </div>

              <div>
                <label className="block text-yellow-400 text-sm font-black uppercase mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Max Participants
                </label>
                <input
                  type="number"
                  min="2"
                  value={formData.max_participants}
                  onChange={(e) => handleInputChange('max_participants', e.target.value)}
                  placeholder="No limit"
                  disabled={creating}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-white placeholder-slate-500 disabled:opacity-50"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '2px solid #4b5563',
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl p-5" style={{
              background: 'rgba(212, 175, 55, 0.1)',
              border: '2px solid rgba(212, 175, 55, 0.3)',
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-yellow-400" />
                  <div>
                    <h3 className="font-black text-white uppercase">Private Bet</h3>
                    <p className="text-sm text-slate-300 font-semibold">Only people with invite code can join</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_private}
                    onChange={(e) => handleInputChange('is_private', e.target.checked)}
                    className="sr-only peer"
                    disabled={creating}
                  />
                  <div className="w-14 h-7 rounded-full peer transition-all relative" style={{
                    background: formData.is_private 
                      ? 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)' 
                      : '#4b5563',
                  }}>
                    <div className="absolute top-[2px] left-[2px] bg-white rounded-full h-6 w-6 transition-transform" style={{
                      transform: formData.is_private ? 'translateX(28px)' : 'translateX(0)',
                    }}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t-2" style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderColor: '#d4af37',
        }}>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={creating}
              className="flex-1 py-3 rounded-lg font-black uppercase text-sm transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: '#fff',
                border: '2px solid #374151',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex-1 py-3 rounded-lg font-black uppercase text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: creating 
                  ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                  : 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                color: creating ? '#fff' : '#000',
                border: '2px solid #000',
                boxShadow: creating ? 'none' : '0 4px 15px rgba(212, 175, 55, 0.4)',
              }}
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Create Side Bet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideBetsPage;