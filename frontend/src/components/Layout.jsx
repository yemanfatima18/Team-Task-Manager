import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const doLogout = () => { logout(); nav('/login') }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>⬡ Ethara</h2>
          <div className="tagline">Team Task Manager</div>
          <span className={`role-badge ${user.role === 'Admin' ? 'admin' : ''}`}>{user.role}</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Main</div>
          <NavLink to="/"        end className={({isActive})=>`nav-item${isActive?' active':''}`}><span className="nav-icon">📊</span> Dashboard</NavLink>
          <NavLink to="/projects"    className={({isActive})=>`nav-item${isActive?' active':''}`}><span className="nav-icon">📁</span> Projects</NavLink>
          <NavLink to="/tasks"       className={({isActive})=>`nav-item${isActive?' active':''}`}><span className="nav-icon">✅</span> Tasks</NavLink>
          <NavLink to="/team"        className={({isActive})=>`nav-item${isActive?' active':''}`}><span className="nav-icon">👥</span> Team</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar" style={{background: user.color || '#2563eb'}}>{user.name[0].toUpperCase()}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={doLogout}>🚪 Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
