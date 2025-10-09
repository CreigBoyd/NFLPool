import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, MessageSquare, Bell, Save, Trophy, Target, Calendar } from 'lucide-react';

function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    display_name: '',
    bio: '',
    phone: '',
    notification_preferences: {
      email: true,
      push: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalPools: 0,
    totalPicks: 0,
    correctPicks: 0,
    winRate: 0,
    totalPoints: 0
  });
  const [pickHistory, setPickHistory] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchPickHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile({
          ...data,
          notification_preferences: data.notification_preferences || { email: true, push: false }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/my-picks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        let totalPools = data.length;
        let totalPicks = 0;
        let correctPicks = 0;
        let totalPoints = 0;
        
        data.forEach(poolData => {
          totalPicks += poolData.stats.total;
          correctPicks += poolData.stats.correct;
          totalPoints += poolData.stats.totalPoints;
        });
        
        const winRate = totalPicks > 0 ? (correctPicks / totalPicks * 100).toFixed(1) : 0;
        
        setStats({
          totalPools,
          totalPicks,
          correctPicks,
          winRate,
          totalPoints
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPickHistory = async () => {
    try {
      const response = await fetch('/api/my-picks?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPickHistory(data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching pick history:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (type, value) => {
    setProfile(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [type]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          display_name: profile.display_name,
          bio: profile.bio,
          phone: profile.phone,
          notification_preferences: profile.notification_preferences
        })
      });
      
      if (response.ok) {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-64 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-semibold text-white mb-4 tracking-tight leading-tight">My Profile</h1>
          <p className="text-white/60 text-lg">Manage your account settings and view your performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="max-w-4xl">
              <div className="p-0.5 rounded-[45px] bg-gradient-to-br from-gray-700/50 via-gray-300/50 to-gray-700/50">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[44px] p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6 leading-10 tracking-tight flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={profile.username}
                          disabled
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white/60 backdrop-blur-sm"
                        />
                        <p className="text-xs text-white/50 mt-1">Username cannot be changed</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white/60 backdrop-blur-sm"
                        />
                        <p className="text-xs text-white/50 mt-1">Contact admin to change email</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={profile.display_name || ''}
                          onChange={(e) => handleInputChange('display_name', e.target.value)}
                          placeholder="How you want to be displayed"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          <Phone className="h-4 w-4 inline mr-1" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="(555) 123-4567"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        <MessageSquare className="h-4 w-4 inline mr-1" />
                        Bio
                      </label>
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell others about yourself..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="max-w-4xl">
              <div className="p-0.5 rounded-[45px] bg-gradient-to-br from-gray-700/50 via-gray-300/50 to-gray-700/50">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[44px] p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6 leading-10 tracking-tight flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Preferences
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">Email Notifications</h3>
                        <p className="text-sm text-white/60">Receive updates about pools and scores via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.notification_preferences.email}
                          onChange={(e) => handleNotificationChange('email', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">Push Notifications</h3>
                        <p className="text-sm text-white/60">Get real-time updates on your device</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.notification_preferences.push}
                          onChange={(e) => handleNotificationChange('push', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-700 border border-blue-500/30 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Stats & Performance */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="p-0.5 rounded-[45px] bg-gradient-to-br from-gray-700/50 via-gray-300/50 to-gray-700/50">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[44px] p-8">
                <h2 className="text-xl font-semibold text-white mb-6 leading-10 tracking-tight flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Performance Stats
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Pools</span>
                    <span className="font-semibold text-white">{stats.totalPools}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Picks</span>
                    <span className="font-semibold text-white">{stats.totalPicks}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Correct Picks</span>
                    <span className="font-semibold text-green-400">{stats.correctPicks}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Win Rate</span>
                    <span className="font-semibold text-blue-400">{stats.winRate}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Points</span>
                    <span className="font-semibold text-white">{stats.totalPoints}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Performance */}
            <div className="p-0.5 rounded-[45px] bg-gradient-to-br from-gray-700/50 via-gray-300/50 to-gray-700/50">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[44px] p-8">
                <h2 className="text-xl font-semibold text-white mb-6 leading-10 tracking-tight flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Recent Performance
                </h2>
                
                {pickHistory.length > 0 ? (
                  <div className="space-y-3">
                    {pickHistory.map((poolData, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-white text-sm">
                            {poolData.pool.name}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm border ${
                            poolData.pool.status === 'completed' ? 'bg-white/10 border-white/20 text-white' :
                            poolData.pool.status === 'active' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                            'bg-blue-500/20 border-blue-500/30 text-blue-400'
                          }`}>
                            {poolData.pool.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-medium text-white">{poolData.stats.correct}</div>
                            <div className="text-white/60">Correct</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-white">{poolData.stats.total}</div>
                            <div className="text-white/60">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-blue-400">{poolData.stats.totalPoints}</div>
                            <div className="text-white/60">Points</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/50 text-sm text-center py-4">
                    No recent performance data available
                  </p>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="p-0.5 rounded-[45px] bg-gradient-to-br from-gray-700/50 via-gray-300/50 to-gray-700/50">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[44px] p-8">
                <h2 className="text-xl font-semibold text-white mb-6 leading-10 tracking-tight flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Account Info
                </h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Member Since</span>
                    <span className="text-white">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Account Status</span>
                    <span className="text-green-400 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;