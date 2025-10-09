import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';

import LoginPage from './pages/LoginPage';
import PoolsPage from './pages/PoolsPage';
import PicksPage from './pages/PicksPage';
import AdminPage from './pages/AdminPage';
import MyPicksPage from './pages/MyPicksPage';
import ProfilePage from './pages/ProfilePage';
import SideBetsPage from './pages/SideBetsPage';
import LiveScoresPage from './pages/LiveScoresPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NFLDashboard from './components/NFLDashboard';

// Import the LoadingScreen component
import LoadingScreen from './components/LoadingScreen';


function App() {

 const [loading, setLoading] = useState(true);

  if (loading) {
    // Show loading screen and hide entire app
    return <LoadingScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public routes WITHOUT Layout */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected routes WITH Layout */}
            <Route
              path="/pools"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PoolsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/pools/:poolId/picks"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PicksPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/pools/:poolId/leaderboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LeaderboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/pools/:poolId/live-scores"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LiveScoresPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-picks"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyPicksPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/side-bets"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SideBetsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/upcoming-games"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NFLDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
  path="*"
  element={
    <ProtectedRoute>
      <Layout>
        <NotFoundPage />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/contact"
  element={
    <Layout>
      <ContactPage />
    </Layout>
  }
/>

<Route path="/terms" element={<Layout><TermsPage /></Layout>} />
<Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
          </Routes>
          
          {/* ToastContainer outside everything for proper positioning */}
          <ToastContainer />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;