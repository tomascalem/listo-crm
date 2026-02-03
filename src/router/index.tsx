import { Routes, Route } from 'react-router-dom'
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

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/venues" element={<Venues />} />
      <Route path="/venues/:id" element={<VenueDetail />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/contacts/:id" element={<ContactDetail />} />
      <Route path="/pipeline" element={<Pipeline />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/operators/:id" element={<OperatorDetail />} />
      <Route path="/concessionaires/:id" element={<ConcessionaireDetail />} />
    </Routes>
  )
}
