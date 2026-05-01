import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './components/AuthContext'
import AuthPage   from './pages/AuthPage'
import Layout     from './components/Layout'
import Dashboard  from './pages/Dashboard'
import Projects   from './pages/Projects'
import Tasks      from './pages/Tasks'
import Team       from './pages/Team'

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner">Loading…</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#94a3b8',fontSize:14}}>Loading…</div>
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<Guard><Layout /></Guard>}>
        <Route index      element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tasks"    element={<Tasks />} />
        <Route path="team"     element={<Team />} />
      </Route>
    </Routes>
  )
}
