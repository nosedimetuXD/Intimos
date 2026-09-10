import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginScreen from './pages/LoginScreen'
import HomeScreen from './pages/HomeScreen'
import CheckInScreen from './pages/CheckInScreen'
import DailyChallengeScreen from './pages/DailyChallengeScreen'
import GamePlayerScreen from './pages/GamePlayerScreen'
import BibleScreen from './pages/BibleScreen'
import CommunityScreen from './pages/CommunityScreen'
import ProfileScreen from './pages/ProfileScreen'
import CentralHome from './pages/CentralHome'

function PrivateRoute({ children, requireTeam = false }) {
  const { currentUser, isTeam, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Cargando Íntimos...
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (requireTeam && !isTeam) {
    return <Navigate to="/home" replace />
  }

  return children
}

function AppRoutes() {
  const { currentUser } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/home" replace /> : <LoginScreen />} />

      {/* Public / Members App */}
      <Route path="/home" element={<PrivateRoute><Layout><HomeScreen /></Layout></PrivateRoute>} />
      <Route path="/checkin" element={<PrivateRoute><Layout><CheckInScreen /></Layout></PrivateRoute>} />
      <Route path="/retos" element={<PrivateRoute><Layout><DailyChallengeScreen /></Layout></PrivateRoute>} />
      <Route path="/retos/:type" element={<PrivateRoute><Layout><GamePlayerScreen /></Layout></PrivateRoute>} />
      <Route path="/biblia" element={<PrivateRoute><Layout><BibleScreen /></Layout></PrivateRoute>} />
      <Route path="/comunidad" element={<PrivateRoute><Layout><CommunityScreen /></Layout></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><Layout><ProfileScreen /></Layout></PrivateRoute>} />

      {/* Central / Leadership App */}
      <Route path="/central" element={<PrivateRoute requireTeam><Layout><CentralHome /></Layout></PrivateRoute>} />

      <Route path="*" element={<Navigate to={currentUser ? "/home" : "/login"} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
