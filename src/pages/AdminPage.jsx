import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Shield, UserCheck, UserX, Edit, Trash2, X, Trophy, RefreshCw, CalendarDays } from 'lucide-react';
import {  CheckCircle } from 'lucide-react';
import NFLDashboard from '../components/NFLDashboard';
import { API_BASE_URL } from '../config/api';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      // fetchUsers replacement
const response = await fetch(`${API_BASE_URL}/admin/users`, {
  headers: { Authorization: `Bearer ${token}` },
  credentials: 'include'
});
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Network error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      // fetchUsers replacement
const response = await fetch(`${API_BASE_URL}/admin/users`, {
  headers: { Authorization: `Bearer ${token}` },
  credentials: 'include'
});

      if (response.ok) {
        fetchUsers();
        setSuccess('User status updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Network error updating user status');
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchUsers();
        setSuccess('User updated successfully');
        setEditingUser(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Network error updating user');
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUsers();
        setSuccess('User deleted successfully');
        setDeleteConfirm(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Network error deleting user');
    }
  };

  // Edit User Modal Component
  const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(user.id, formData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Edit User</h3>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = ({ user, onClose, onConfirm }) => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Confirm Deletion</h3>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-white/80 mb-6">
            Are you sure you want to delete user <strong>{user.username}</strong>? This action cannot be undone.
          </p>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(user.id)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    );
  };

  // AdminSideBets component
  function AdminSideBets({ token }) {
    const [sideBets, setSideBets] = useState([]);
    // At the very beginning of AdminSideBets component function body
const [detailsModal, setDetailsModal] = useState(null);
const [betDetails, setBetDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedBet, setSelectedBet] = useState(null);
    const [settleModal, setSettleModal] = useState(false);
    const [settlementData, setSettlementData] = useState({
      winning_option_id: '',
      actual_result: ''
    });

    useEffect(() => {
      fetchSideBets();
    }, []);

    const viewBetDetails = async (betId) => {
  try {
    // fetchSideBets replacement (AdminSideBets)
const response = await fetch(`${API_BASE_URL}/admin/side-bets`, {
  headers: { Authorization: `Bearer ${token}` },
  credentials: 'include'
});
    
    if (response.ok) {
      const data = await response.json();
      setBetDetails(data);
      setDetailsModal(betId);
    }
  } catch (error) {
    console.error('Error fetching bet details:', error);
  }
};

    const fetchSideBets = async () => {
      setLoading(true);
      try {
        // closeSideBet replacement
const response = await fetch(`${API_BASE_URL}/admin/side-bets/${sideBetId}/close`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  credentials: 'include'
});

        if (response.ok) {
          const data = await response.json();
          setSideBets(data);
        }
      } catch (error) {
        console.error('Error fetching side bets:', error);
      } finally {
        setLoading(false);
      }
    };

    const closeSideBet = async (sideBetId) => {
      if (!confirm('Close this side bet? No new participants can join after closing.')) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/side-bets/${sideBetId}/close`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          alert('Side bet closed successfully');
          fetchSideBets();
        } else {
          alert('Failed to close side bet');
        }
      } catch (error) {
        console.error('Error closing side bet:', error);
        alert('Failed to close side bet');
      }
    };

    const openSettleModal = async (sideBet) => {
      setSelectedBet(sideBet);
      
      try {
        const response = await fetch(`${API_BASE_URL}/side-bets/${sideBet.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const betDetails = await response.json();
          setSelectedBet(betDetails);
          setSettleModal(true);
        }
      } catch (error) {
        console.error('Error fetching bet details:', error);
      }
    };

    const settleSideBet = async () => {
      if (!selectedBet) return;

      if (selectedBet.bet_type === 'multiple_choice' && !settlementData.winning_option_id) {
        alert('Please select a winning option');
        return;
      }

      if ((selectedBet.bet_type === 'prediction' || selectedBet.bet_type === 'over_under') && !settlementData.actual_result) {
        alert('Please enter the actual result');
        return;
      }

      try {
        // settleSideBet replacement
const response = await fetch(`${API_BASE_URL}/admin/side-bets/${selectedBet.id}/settle`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(settlementData),
});

        if (response.ok) {
          const result = await response.json();
          alert(`Side bet settled! ${result.winners} winner(s), Total pot: $${result.totalPot.toFixed(2)}`);
          setSettleModal(false);
          setSettlementData({ winning_option_id: '', actual_result: '' });
          fetchSideBets();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to settle side bet');
        }
      } catch (error) {
        console.error('Error settling side bet:', error);
        alert('Failed to settle side bet');
      }
    };

    const reopenSideBet = async (sideBetId) => {
      if (!confirm('Reopen this side bet? This will clear settlement data.')) return;

      try {
        await fetch(`${API_BASE_URL}/admin/side-bets/${sideBetId}/reopen`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  credentials: 'include'
});
        if (response.ok) {
          alert('Side bet reopened successfully');
          fetchSideBets();
        } else {
          alert('Failed to reopen side bet');
        }
      } catch (error) {
        console.error('Error reopening side bet:', error);
        alert('Failed to reopen side bet');
      }
    };

    const deleteSideBet = async (sideBetId) => {
      if (!confirm('Delete this side bet? This action cannot be undone.')) return;

      try {
        await fetch(`${API_BASE_URL}/admin/side-bets/${sideBetId}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
  credentials: 'include'
});

        if (response.ok) {
          alert('Side bet deleted successfully');
          fetchSideBets();
        } else {
          alert('Failed to delete side bet');
        }
      } catch (error) {
        console.error('Error deleting side bet:', error);
        alert('Failed to delete side bet');
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'open':
          return 'bg-green-500/20 border-green-500/30 text-green-400';
        case 'closed':
          return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
        case 'settled':
          return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
        default:
          return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Side Bets Management</h2>
            <p className="text-white/60">Manage and settle side bets</p>
          </div>
          <button
            onClick={fetchSideBets}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : sideBets.length === 0 ? (
          <div className="bg-white/5 rounded-lg p-8 text-center border border-white/10">
            <p className="text-white/60">No side bets found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sideBets.map((bet) => (
              <div key={bet.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{bet.title}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(bet.status)}`}>
                        {bet.status}
                      </span>
                      {bet.is_private && (
                        <span className="px-2 py-1 text-xs bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded">
                          Private
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm mb-2">{bet.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span>Type: <span className="text-white capitalize">{bet.bet_type.replace('_', ' ')}</span></span>
                      <span>•</span>
                      <span>Creator: <span className="text-white">{bet.creator_name}</span></span>
                      <span>•</span>
                      <span>Participants: <span className="text-white">{bet.participant_count}</span></span>
                      <span>•</span>
                      <span>Pot: <span className="text-white">${parseFloat(bet.total_pot || 0).toFixed(2)}</span></span>
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      Deadline: {new Date(bet.deadline).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {bet.status === 'open' && (
                      <button
                        onClick={() => closeSideBet(bet.id)}
                        className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm transition-colors"
                      >
                        Close
                      </button>
                    )}

                    {bet.status === 'closed' && (
                      <button
                        onClick={() => openSettleModal(bet)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                      >
                        Settle
                      </button>
                    )}

                    {bet.status === 'settled' && (
                      <button
                        onClick={() => reopenSideBet(bet.id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                      >
                        Reopen
                      </button>
                    )}

                    <button
                      onClick={() => deleteSideBet(bet.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
                    >
                      Delete
                    </button>
                    <button
  onClick={() => viewBetDetails(bet.id)}
  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm transition-colors"
>
  Details
</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        

{detailsModal && betDetails && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/10">
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-white/10 flex justify-between items-center z-10">
        <h3 className="text-xl font-semibold text-white">{betDetails.bet.title}</h3>
        <button onClick={() => setDetailsModal(null)} className="text-white/60 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/60 text-sm">Total Pot</p>
            <p className="text-2xl font-bold text-green-400">${betDetails.stats.totalPot.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/60 text-sm">Participants</p>
            <p className="text-2xl font-bold text-blue-400">{betDetails.stats.totalParticipants}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/60 text-sm">Avg Wager</p>
            <p className="text-2xl font-bold text-purple-400">${betDetails.stats.averageWager.toFixed(2)}</p>
          </div>
        </div>

        {/* Options Breakdown */}
        {betDetails.options && betDetails.options.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Options & Picks</h4>
            <div className="space-y-2">
              {betDetails.options.map(option => (
                <div key={option.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{option.option_text}</span>
                    <span className="text-white/60">{option.pick_count} picks</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(option.pick_count / betDetails.stats.totalParticipants) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participants List */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">All Participants</h4>
          <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/80 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/80 uppercase">Pick</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white/80 uppercase">Wagered</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white/80 uppercase">Potential Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {betDetails.participants.map(participant => (
                  <tr key={participant.id}>
                    <td className="px-4 py-3 text-white">{participant.username}</td>
                    <td className="px-4 py-3 text-white/60">
                      {participant.option_text || participant.prediction_value || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right text-green-400">
                      ${parseFloat(participant.amount_wagered || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-yellow-400">
                      ${parseFloat(participant.potential_payout || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {settleModal && selectedBet && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Settle Side Bet</h3>
                <button onClick={() => setSettleModal(false)} className="text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-white font-medium mb-2">{selectedBet.title}</p>
                <p className="text-white/60 text-sm mb-4">{selectedBet.description}</p>
              </div>

              <div className="space-y-4">
                {(selectedBet.bet_type === 'multiple_choice' || selectedBet.bet_type === 'binary') && selectedBet.options && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Select Winning Option
                    </label>
                    <select
                      value={settlementData.winning_option_id}
                      onChange={(e) => setSettlementData({ ...settlementData, winning_option_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose winner...</option>
                      {selectedBet.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.option_text} (Odds: {option.odds})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(selectedBet.bet_type === 'prediction' || selectedBet.bet_type === 'over_under') && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Actual Result
                    </label>
                    <input
                      type="text"
                      value={settlementData.actual_result}
                      onChange={(e) => setSettlementData({ ...settlementData, actual_result: e.target.value })}
                      placeholder="Enter the actual result"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white/60 text-sm mb-2">Settlement Details:</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-white">Total Participants: {selectedBet.participants?.length || 0}</p>
                    <p className="text-white">Total Pot: ${parseFloat(selectedBet.participants?.reduce((sum, p) => sum + parseFloat(p.amount_wagered || 0), 0) || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 mt-4 border-t border-white/10">
                <button
                  onClick={() => setSettleModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={settleSideBet}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Settle Bet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // AdminLiveScores component
  function AdminLiveScores() {
    const [pools, setPools] = useState([]);
    const [selectedPool, setSelectedPool] = useState('');
    const [games, setGames] = useState([]);
    const [loadingScores, setLoadingScores] = useState(false);

    useEffect(() => {
      fetchPools();
    }, []);

    useEffect(() => {
      if (selectedPool) {
        fetchGames();
      }
    }, [selectedPool]);

const fetchPools = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pools`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      setPools(data);
      if (data.length > 0) {
        setSelectedPool(data[0].id.toString());
      }
    } else {
      console.error('Failed to fetch pools: ', response.status);
    }
  } catch (error) {
    console.error('Error fetching pools:', error);
  }
};


    const fetchGames = async () => {
      if (!selectedPool) return;

      setLoadingScores(true);
      try {
        const response = await fetch(`${API_BASE_URL}/pools/${selectedPool}/games`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setGames(data);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoadingScores(false);
      }
    };

    const updateGameScore = async (gameId, scoreData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/games/${gameId}/update-score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(scoreData),
        });

        if (response.ok) {
          fetchGames();
          alert('Score updated successfully!');
        } else {
          alert('Failed to update score');
        }
      } catch (error) {
        console.error('Error updating score:', error);
        alert('Failed to update score');
      }
    };

    function GameScoreUpdateCard({ game, onUpdateScore }) {
      const initialQuarter = Number.isInteger(game.quarter) ? game.quarter : 1;

      const [scores, setScores] = useState({
        home_score: game.home_score || 0,
        away_score: game.away_score || 0,
        status: game.status || 'scheduled',
        quarter: initialQuarter,
        time_remaining: game.time_remaining || '15:00',
        possession: game.possession || '',
      });

      const handleScoreChange = (field, value) => {
        setScores((prev) => ({
          ...prev,
          [field]: value,
        }));
      };

      const handleSubmit = () => {
        onUpdateScore(game.id, scores);
      };

      const getStatusColor = (status) => {
        switch (status) {
          case 'scheduled':
            return 'bg-neutral-100 text-neutral-800';
          case 'in_progress':
            return 'bg-green-100 text-green-800';
          case 'settled':
            return 'bg-blue-100 text-blue-800';
          default:
            return 'bg-neutral-100 text-neutral-800';
        }
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {game.away_team} @ {game.home_team}
              </h3>
              <p className="text-sm text-neutral-600">
                {new Date(game.game_date).toLocaleDateString()} at{' '}
                {new Date(game.game_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(scores.status)}`}>
              {scores.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-neutral-900">Score Update</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {game.away_team} Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scores.away_score}
                    onChange={(e) => handleScoreChange('away_score', parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {game.home_team} Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scores.home_score}
                    onChange={(e) => handleScoreChange('home_score', parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Game Status</label>
                <select
                  value={scores.status}
                  onChange={(e) => handleScoreChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                 <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {scores.status === 'in_progress' && (
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-900">Game Details</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Quarter</label>
                    <select
                      value={scores.quarter}
                      onChange={(e) => handleScoreChange('quarter', parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={1}>1st Quarter</option>
                      <option value={2}>2nd Quarter</option>
                      <option value={3}>3rd Quarter</option>
                      <option value={4}>4th Quarter</option>
                      <option value={5}>Overtime</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Time Remaining</label>
                    <input
                      type="text"
                      value={scores.time_remaining}
                      onChange={(e) => handleScoreChange('time_remaining', e.target.value)}
                      placeholder="15:00"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Possession</label>
                  <select
                    value={scores.possession}
                    onChange={(e) => handleScoreChange('possession', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">No Possession</option>
                    <option value={game.home_team}>{game.home_team}</option>
                    <option value={game.away_team}>{game.away_team}</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-neutral-200">
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              type="button"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Update Score</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Live Score Updates</h2>
          <p className="text-neutral-600">Update game scores in real-time for all participants</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium text-neutral-700">Select Pool:</label>
            <select
              value={selectedPool}
              onChange={(e) => setSelectedPool(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choose a pool...</option>
              {pools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.name} - Week {pool.week_number}
                </option>
              ))}
            </select>

            <button
              onClick={fetchGames}
              disabled={loadingScores}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              type="button"
            >
              <RefreshCw className={`h-4 w-4 ${loadingScores ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {games.length > 0 && (
          <div className="space-y-4">
            {games.map((game) => (
              <GameScoreUpdateCard key={game.id} game={game} onUpdateScore={updateGameScore} />
            ))}
          </div>
        )}

        {selectedPool && games.length === 0 && !loadingScores && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">No games found for this pool</p>
          </div>
        )}
      </div>
    );
  }

  const CreatePoolForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      weekNumber: 1,
      seasonYear: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      games: [],
    });

    const [newGame, setNewGame] = useState({
      homeTeam: '',
      awayTeam: '',
      gameDate: '',
    });

    const [submitting, setSubmitting] = useState(false);

    const nflTeams = [
      'Arizona Cardinals', 'Atlanta Falcons', 'Baltimore Ravens', 'Buffalo Bills',
      'Carolina Panthers', 'Chicago Bears', 'Cincinnati Bengals', 'Cleveland Browns',
      'Dallas Cowboys', 'Denver Broncos', 'Detroit Lions', 'Green Bay Packers',
      'Houston Texans', 'Indianapolis Colts', 'Jacksonville Jaguars', 'Kansas City Chiefs',
      'Las Vegas Raiders', 'Los Angeles Chargers', 'Los Angeles Rams', 'Miami Dolphins',
      'Minnesota Vikings', 'New England Patriots', 'New Orleans Saints', 'New York Giants',
      'New York Jets', 'Philadelphia Eagles', 'Pittsburgh Steelers', 'San Francisco 49ers',
      'Seattle Seahawks', 'Tampa Bay Buccaneers', 'Tennessee Titans', 'Washington Commanders',
    ];

    const addGame = () => {
      if (newGame.homeTeam && newGame.awayTeam && newGame.gameDate && newGame.homeTeam !== newGame.awayTeam) {
        setFormData((prev) => ({
          ...prev,
          games: [...prev.games, { ...newGame }],
        }));
        setNewGame({ homeTeam: '', awayTeam: '', gameDate: '' });
        setError('');
      } else {
        setError('Please fill all game fields and ensure home and away teams are different');
      }
    };

    const removeGame = (index) => {
      setFormData((prev) => ({
        ...prev,
        games: prev.games.filter((_, i) => i !== index),
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setError('');
      setSuccess('');

      if (!formData.endDate) {
        setError('End date is required');
        setSubmitting(false);
        return;
      }

      if (formData.games.length === 0) {
        setError('At least one game must be added');
        setSubmitting(false);
        return;
      }

      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        setError('End date must be after start date');
        setSubmitting(false);
        return;
      }

      try {
        const requestData = {
          name: formData.name,
          weekNumber: parseInt(formData.weekNumber, 10),
          seasonYear: parseInt(formData.seasonYear, 10),
          startDate: formData.startDate,
          endDate: formData.endDate,
          games: formData.games.map((game) => ({
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            gameDate: game.gameDate,
          })),
        };
const response = await fetch(`${API_BASE_URL}/admin/pools`, {
       
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });

        const result = await response.json();

        if (response.ok) {
          setSuccess('Pool created successfully!');
          setFormData({
            name: '',
            weekNumber: 1,
            seasonYear: new Date().getFullYear(),
            startDate: '',
            endDate: '',
            games: [],
          });
        } else {
          setError(result.error || 'Failed to create pool');
        }
      } catch (error) {
        console.error('Error creating pool:', error);
        setError('Network error creating pool');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Create New Pool</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Pool Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Week 1 NFL Pool"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Week Number *</label>
              <input
                type="number"
                min="1"
                max="18"
                required
                value={formData.weekNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, weekNumber: e.target.value ? parseInt(e.target.value, 10) : '' }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Season Year *</label>
              <input
                type="number"
                min="2023"
                max="2030"
                required
                value={formData.seasonYear}
                onChange={(e) => setFormData((prev) => ({ ...prev, seasonYear: e.target.value ? parseInt(e.target.value, 10) : '' }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date *</label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">End Date *</label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-md font-semibold text-neutral-900 mb-4">Add Games</h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Home Team *</label>
                <select
                  value={newGame.homeTeam}
                  onChange={(e) => setNewGame((prev) => ({ ...prev, homeTeam: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select team</option>
                  {nflTeams.filter((team) => team !== newGame.awayTeam).map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Away Team *</label>
                <select
                  value={newGame.awayTeam}
                  onChange={(e) => setNewGame((prev) => ({ ...prev, awayTeam: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select team</option>
                  {nflTeams.filter((team) => team !== newGame.homeTeam).map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Game Date *</label>
                <input
                  type="datetime-local"
                  value={newGame.gameDate}
                  onChange={(e) => setNewGame((prev) => ({ ...prev, gameDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addGame}
                  className="w-full bg-neutral-600 text-white px-4 py-2 rounded-md hover:bg-neutral-700 disabled:opacity-50"
                  disabled={!newGame.homeTeam || !newGame.awayTeam || !newGame.gameDate}
                >
                  Add Game
                </button>
              </div>
            </div>

            {formData.games.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-neutral-900">
                  Games Added ({formData.games.length}):
                </h5>
                {formData.games.map((game, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-neutral-50 p-3 rounded-md"
                  >
                    <span className="text-sm">
                      {game.awayTeam} @ {game.homeTeam} -{' '}
                      {new Date(game.gameDate).toLocaleDateString()}{' '}
                      {new Date(game.gameDate).toLocaleTimeString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeGame(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={formData.games.length === 0 || submitting}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium flex items-center justify-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Pool...
              </>
            ) : (
              'Create Pool'
            )}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-2">Admin Dashboard</h1>
        <p >Manage users and pools</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-400">{error}</div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md text-green-400">{success}</div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="">
          <div className="">
            <div className="">
              <nav className="flex space-x-8 px-8">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-yellow-600 text-yellow-400'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                  type="button"
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  User Management
                </button>

                <button
                  onClick={() => setActiveTab('sideBets')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'sideBets'
                      ? 'border-yellow-500 text-blue-400'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                  type="button"
                >
                  <Trophy className="h-4 w-4 inline mr-2" />
                  Side Bets
                </button>

                <button
                  onClick={() => setActiveTab('pools')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pools'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                  type="button"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Create Pool
                </button>

                <button
                  onClick={() => setActiveTab('liveScores')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'liveScores'
                      ? 'border-yellow-500 text-blue-400'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                  type="button"
                >
                  <RefreshCw className="h-4 w-4 inline mr-2" />
                  Live Score Updates
                </button>

<button
  onClick={() => setActiveTab('upcomingGames')}
  className={`py-4 px-1 border-b-2 font-medium text-sm ${
    activeTab === 'upcomingGames'
      ? 'border-yellow-500 text-blue-400'
      : 'border-transparent text-white/60 hover:text-white/80'
  }`}
  type="button"
>
  <CalendarDays className="h-4 w-4 inline mr-2" />
  NFL Games
</button>

              </nav>
            </div>

            <div className="p-8">
{activeTab === 'users' && (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-semibold text-white leading-10 tracking-tight">
        User Management
      </h3>
      <button
        onClick={fetchUsers}
        disabled={loading}
        className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </button>
    </div>

    {loading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    ) : users.length === 0 ? (
      <p className="text-white/50 text-center py-8">No users found</p>
    ) : (
      <div 
  className="inline-block w-full p-10 text-white rounded-lg backdrop-blur-sm"
  style={{
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  }}
>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{user.username}</div>
                      <div className="text-sm text-white/60">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`flex items-center space-x-1 text-sm ${
                        user.role === 'admin' ? 'text-blue-400' : 'text-white/80'
                      }`}
                    >
                      {user.role === 'admin' && <Shield className="h-3 w-3" />}
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full backdrop-blur-sm border ${
                        user.status === 'approved'
                          ? 'bg-green-500/20 border-green-500/30 text-green-400'
                          : user.status === 'pending'
                          ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                          : 'bg-red-500/20 border-red-500/30 text-red-400'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {user.status === 'pending' && (
                        <button
                          onClick={() => updateUserStatus(user.id, 'approved')}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors"
                          title="Approve User"
                          type="button"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      
                      {user.status === 'approved' && user.role !== 'admin' && (
                        <button
                          onClick={() => updateUserStatus(user.id, 'suspended')}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded transition-colors"
                          title="Suspend User"
                          type="button"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      )}

                      {user.status === 'suspended' && (
                        <button
                          onClick={() => updateUserStatus(user.id, 'approved')}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors"
                          title="Reactivate User"
                          type="button"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                        title="Edit User"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {user.role !== 'admin' && (
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete User"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
)}

              {activeTab === 'pools' && <CreatePoolForm />}

              {activeTab === 'liveScores' && <AdminLiveScores />}
              
              {activeTab === 'sideBets' && <AdminSideBets token={token} />}

                 {activeTab === 'upcomingGames' && <NFLDashboard />}
            </div>
          </div>
        </div>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={updateUser}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          user={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={deleteUser}
        />
      )}
    </div>
  );
}

export default AdminPage;