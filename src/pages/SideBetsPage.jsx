import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Users, Clock, DollarSign, Lock, Unlock, Copy, Check, TrendingUp, Award } from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config/api'; // adjust path if file is in a different folder

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

// fetchSideBets replacement
const fetchSideBets = async () => {
  setLoading(true);
  setError('');
  try {
    const statusParam = activeTab === 'all' ? '' : `?status=${encodeURIComponent(activeTab)}`;
    const response = await fetch(`${API_BASE_URL}/api/side-bets${statusParam}`, {
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
      // joinSideBetByCode replacement
const response = await fetch(`${API_BASE_URL}/api/side-bets/join-by-code`, {
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
      const response = await fetch(`${API_BASE_URL}/api/side-bets/${bet.id}/results`, {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-yellow-100 text-yellow-800';
      case 'settled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          <div className="bg-red-600 border-2 border-red-800 text-white px-4 py-3 rounded-lg font-bold mb-6">
            {error}
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
            {sideBets.map((bet) => (
              <SideBetCard
                key={bet.id}
                bet={bet}
                onCopyCode={copyInviteCode}
                copiedCode={copiedCode}
                onRefresh={fetchSideBets}
                onViewResults={viewResults}
              />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Join with Invite Code</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={6}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setInviteCode('');
                }}
                className="flex-1 bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg font-medium hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                onClick={joinSideBetByCode}
                disabled={inviteCode.length !== 6}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                Join
              </button>
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
    </div>
  );
}

// Side Bet Card Component with FOOTBALL STYLING
function SideBetCard({ bet, onCopyCode, copiedCode, onRefresh, onViewResults }) {
  const { token } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const joinSideBet = async (optionId = null, predictionValue = null) => {
    try {
      // joinSideBet replacement
const response = await fetch(`${API_BASE_URL}/api/side-bets/${bet.id}/join`, {
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
      {/* Card Header */}
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
      
      {/* Card Body */}
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
        
        {/* Action Buttons */}
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
          
          {/* Invite Code Section */}
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

// Keep all other components the same (SideBetDetailsModal, ResultsModal, CreateSideBetModal)
// Side Bet Details Modal Component with PROPER OPTIONS FETCHING
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
    const response = await fetch(`/api/side-bets/${bet.id}`, {
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!betDetails) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">{betDetails.title}</h2>
        <p className="text-neutral-600 mb-6">{betDetails.description}</p>
        
        {(betDetails.bet_type === 'multiple_choice' || betDetails.bet_type === 'binary') && betDetails.options && (
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-neutral-900">Select your choice:</h3>
            <div className="space-y-2">
              {betDetails.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full p-3 border rounded-lg text-left transition-all ${
                    selectedOption === option.id 
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
                      : 'border-neutral-300 hover:border-primary-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{option.option_text}</span>
                    {option.odds && (
                      <span className="text-sm text-neutral-600">Odds: {option.odds}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {(betDetails.bet_type === 'prediction' || betDetails.bet_type === 'over_under') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Your Prediction
            </label>
            <input
              type="number"
              value={predictionValue}
              onChange={(e) => setPredictionValue(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your prediction"
            />
          </div>
        )}
        
        {betDetails.entry_fee > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Entry Fee:</strong> ${betDetails.entry_fee}
            </p>
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg font-medium hover:bg-neutral-200"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
          >
            Join Bet
          </button>
        </div>
      </div>
    </div>
  );
}

// Results Modal Component
function ResultsModal({ results, onClose }) {
  const { sideBet, winners } = results;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Bet Results</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">{sideBet.title}</h3>
          <p className="text-neutral-600 mb-4">{sideBet.description}</p>
          
          {sideBet.winning_option && (
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-sm text-neutral-600 mb-1">Winning Option:</p>
              <p className="text-lg font-bold text-green-600">{sideBet.winning_option.option_text}</p>
            </div>
          )}
          
          {sideBet.actual_result && (
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-1">Final Result:</p>
              <p className="text-lg font-bold text-green-600">{sideBet.actual_result}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-500" />
            Winners ({winners.length})
          </h3>
          
          {winners.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">
              <p>No winners for this bet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {winners.map((winner, index) => (
                <div
                  key={winner.id}
                  className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' : 
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{winner.username}</p>
                      {winner.option_text && (
                        <p className="text-sm text-neutral-600">Selected: {winner.option_text}</p>
                      )}
                      {winner.prediction_value && (
                        <p className="text-sm text-neutral-600">Predicted: {winner.prediction_value}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ${parseFloat(winner.potential_payout).toFixed(2)}
                    </p>
                    <p className="text-xs text-neutral-600">payout</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg font-medium hover:bg-neutral-200"
        >
          Close
        </button>
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
      const response = await fetch('/api/side-bets', {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Create Side Bet</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Who will score first touchdown?"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={creating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide more details about the bet..."
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={creating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Bet Type
            </label>
            <select
              value={formData.bet_type}
              onChange={(e) => handleInputChange('bet_type', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={creating}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="binary">Yes/No (Binary)</option>
              <option value="prediction">Prediction (Number)</option>
              <option value="over_under">Over/Under</option>
            </select>
          </div>

          {(formData.bet_type === 'multiple_choice' || formData.bet_type === 'binary') && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Options *
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={creating}
                    />
                    {formData.options.length > 2 && !creating && (
                      <button
                        onClick={() => removeOption(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {!creating && (
                  <button
                    onClick={addOption}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    + Add Option
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Deadline *
            </label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={creating}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Entry Fee ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.entry_fee}
                onChange={(e) => handleInputChange('entry_fee', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={creating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Max Participants
              </label>
              <input
                type="number"
                min="2"
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', e.target.value)}
                placeholder="No limit"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={creating}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-neutral-900">Private Bet</h3>
              <p className="text-sm text-neutral-600">Only people with invite code can join</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_private}
                onChange={(e) => handleInputChange('is_private', e.target.checked)}
                className="sr-only peer"
                disabled={creating}
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        <div className="flex space-x-3 mt-6 pt-6 border-t border-neutral-200">
          <button
            onClick={onClose}
            disabled={creating}
            className="flex-1 bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Side Bet'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SideBetsPage;