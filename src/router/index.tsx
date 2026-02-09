import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../providers/auth-provider'
import Dashboard from '../pages/Dashboard'
import Venues from '../pages/Venues'
import VenueDetail from '../pages/VenueDetail'
import Contacts from '../pages/Contacts'
import ContactDetail from '../pages/ContactDetail'
import Pipeline from '../pages/Pipeline'
import Tasks from '../pages/Tasks'
import Analytics from '../pages/Analytics'
import Settings from '../pages/Settings'
import OperatorDetail from '../pages/OperatorDetail'
import ConcessionaireDetail from '../pages/ConcessionaireDetail'
import Login from '../pages/Login'
import { Loader2 } from 'lucide-react'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/venues" element={<ProtectedRoute><Venues /></ProtectedRoute>} />
      <Route path="/venues/:id" element={<ProtectedRoute><VenueDetail /></ProtectedRoute>} />
      <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
      <Route path="/contacts/:id" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
      <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/operators/:id" element={<ProtectedRoute><OperatorDetail /></ProtectedRoute>} />
      <Route path="/concessionaires/:id" element={<ProtectedRoute><ConcessionaireDetail /></ProtectedRoute>} />
    </Routes>
  )
}
