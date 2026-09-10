import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/ErrorBoundary'

// Public Screens
import LoginScreen from './pages/LoginScreen'
import HomeScreen from './pages/HomeScreen'
import ServicesScreen from './pages/ServicesScreen'
import ServiceDetail from './pages/ServiceDetail'
import CommunityScreen from './pages/CommunityScreen'
import ProfileScreen from './pages/ProfileScreen'
import VoiceScreen from './pages/VoiceScreen'
import MusicScreen from './pages/MusicScreen'
import BibleScreen from './pages/BibleScreen'
import CheckInScreen from './pages/CheckInScreen'
import DailyChallengeScreen from './pages/DailyChallengeScreen'
import GamePlayerScreen from './pages/GamePlayerScreen'

// Central Screens & Management
import CentralHome from './pages/CentralHome'
import ServicesManagement from './components/central/ServicesManagement'
import AttendanceManagement from './components/central/AttendanceManagement'
import IdeasBank from './components/central/IdeasBank'
import Directory from './components/central/Directory'
import PointsManagement from './components/central/PointsManagement'
import Announcements from './components/central/Announcements'
import SuggestionsManagement from './components/central/SuggestionsManagement'
import BirthdaysManagement from './components/central/BirthdaysManagement'
import CampSavings from './components/central/CampSavings'
import ChallengesManagement from './components/central/ChallengesManagement'
import DailyChallengeManagement from './components/central/DailyChallengeManagement'
import UserManagement from './components/central/UserManagement'
import ReflectionsReview from './components/central/ReflectionsReview'
import Finances from './components/central/Finances'
import QRSettings from './components/central/QRSettings'
import PlaylistsManagement from './components/central/PlaylistsManagement'
import AnalyticsChallenge from './components/central/AnalyticsChallenge'
import GroupsAdmin from './components/central/GroupsAdmin'
import FeatureFlagsAdmin from './components/central/FeatureFlagsAdmin'
import PointsSettings from './components/central/PointsSettings'

function PrivateRoute({ 
  children, 
  requireTeam = false, 
  requireUserManager = false, 
  requirePastoral = false, 
  requireSuperAdmin = false 
}) {
  const { currentUser, isTeam, canManageUsers, isPastoral, isSuperAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-muted text-xs">
        Cargando Íntimos...
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/central" replace />
  }

  if (requirePastoral && !isPastoral) {
    return <Navigate to="/central" replace />
  }

  if (requireUserManager && !canManageUsers) {
    return <Navigate to="/central" replace />
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

      {/* ── Public / Members App ── */}
      <Route path="/home" element={<PrivateRoute><Layout><HomeScreen /></Layout></PrivateRoute>} />
      <Route path="/servicios" element={<PrivateRoute><Layout><ServicesScreen /></Layout></PrivateRoute>} />
      <Route path="/servicios/:id" element={<PrivateRoute><Layout><ServiceDetail /></Layout></PrivateRoute>} />
      <Route path="/comunidad" element={<PrivateRoute><Layout><CommunityScreen /></Layout></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><Layout><ProfileScreen /></Layout></PrivateRoute>} />
      <Route path="/mi-voz" element={<PrivateRoute><Layout><VoiceScreen /></Layout></PrivateRoute>} />
      <Route path="/musica" element={<PrivateRoute><Layout><MusicScreen /></Layout></PrivateRoute>} />
      <Route path="/biblia" element={<PrivateRoute><Layout><BibleScreen /></Layout></PrivateRoute>} />
      <Route path="/checkin" element={<PrivateRoute><Layout><CheckInScreen /></Layout></PrivateRoute>} />
      <Route path="/retos" element={<PrivateRoute><Layout><DailyChallengeScreen /></Layout></PrivateRoute>} />
      <Route path="/retos/:type" element={<PrivateRoute><Layout><GamePlayerScreen /></Layout></PrivateRoute>} />

      {/* ── Central / Team Dashboard ── */}
      <Route path="/central" element={<PrivateRoute requireTeam><Layout><CentralHome /></Layout></PrivateRoute>} />
      <Route path="/central/servicios" element={<PrivateRoute requireTeam><Layout><ServicesManagement /></Layout></PrivateRoute>} />
      <Route path="/central/asistencia" element={<PrivateRoute requireTeam><Layout><AttendanceManagement /></Layout></PrivateRoute>} />
      <Route path="/central/ideas" element={<PrivateRoute requireTeam><Layout><IdeasBank /></Layout></PrivateRoute>} />
      <Route path="/central/directorio" element={<PrivateRoute requireTeam><Layout><Directory /></Layout></PrivateRoute>} />
      <Route path="/central/puntos" element={<PrivateRoute requireTeam><Layout><PointsManagement /></Layout></PrivateRoute>} />
      <Route path="/central/avisos" element={<PrivateRoute requireTeam><Layout><Announcements /></Layout></PrivateRoute>} />
      <Route path="/central/sugerencias" element={<PrivateRoute requireTeam><Layout><SuggestionsManagement /></Layout></PrivateRoute>} />
      <Route path="/central/cumpleanos" element={<PrivateRoute requireTeam><Layout><BirthdaysManagement /></Layout></PrivateRoute>} />
      <Route path="/central/campamento" element={<PrivateRoute requireTeam><Layout><CampSavings /></Layout></PrivateRoute>} />
      <Route path="/central/retos" element={<PrivateRoute requireTeam><Layout><ChallengesManagement /></Layout></PrivateRoute>} />
      <Route path="/central/daily-challenge" element={<PrivateRoute requireTeam><Layout><DailyChallengeManagement /></Layout></PrivateRoute>} />

      {/* Central / Equipo (User Management) */}
      <Route path="/central/usuarios" element={<PrivateRoute requireUserManager><Layout><UserManagement /></Layout></PrivateRoute>} />

      {/* Central / Pastoral */}
      <Route path="/central/reflexiones" element={<PrivateRoute requirePastoral><Layout><ReflectionsReview /></Layout></PrivateRoute>} />
      <Route path="/central/finanzas" element={<PrivateRoute requirePastoral><Layout><Finances /></Layout></PrivateRoute>} />
      <Route path="/central/qr" element={<PrivateRoute requirePastoral><Layout><QRSettings /></Layout></PrivateRoute>} />
      <Route path="/central/playlists" element={<PrivateRoute requirePastoral><Layout><PlaylistsManagement /></Layout></PrivateRoute>} />
      <Route path="/central/analytics" element={<PrivateRoute requirePastoral><Layout><AnalyticsChallenge /></Layout></PrivateRoute>} />

      {/* Central / Super Admin */}
      <Route path="/central/grupos" element={<PrivateRoute requireSuperAdmin><Layout><GroupsAdmin /></Layout></PrivateRoute>} />
      <Route path="/central/funcionalidades" element={<PrivateRoute requireSuperAdmin><Layout><FeatureFlagsAdmin /></Layout></PrivateRoute>} />
      <Route path="/central/puntos-config" element={<PrivateRoute requireSuperAdmin><Layout><PointsSettings /></Layout></PrivateRoute>} />

      <Route path="*" element={<Navigate to={currentUser ? "/home" : "/login"} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
