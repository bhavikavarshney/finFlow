import { lazy, Suspense, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { FiActivity, FiBell, FiChevronDown, FiChevronRight, FiCommand, FiCreditCard, FiFileText, FiGrid, FiLogOut, FiMenu, FiMoon, FiSettings, FiShield, FiSun, FiUsers, FiX } from 'react-icons/fi'
import { useAuth } from '../../context/useAuth'
import useTheme from '../../context/useTheme'
import AdminUsers from './AdminUsers'
import AdminOperations from './AdminOperations'
import AdminActivity from './AdminActivity'
import AdminReports from './AdminReports'
import AdminSettings from './AdminSettings'
import AdminProfile from './AdminProfile'

const AdminOverview = lazy(() => import('./AdminOverview'))
const AdminAnalytics = lazy(() => import('./AdminAnalytics'))

const navigation = [
  { label: 'Overview', path: '/admin', icon: FiGrid, component: AdminOverview },
  { label: 'User management', path: '/admin/users', icon: FiUsers, component: AdminUsers },
  { label: 'Usage analytics', path: '/admin/analytics', icon: FiActivity, component: AdminAnalytics },
  { label: 'System health', path: '/admin/health', icon: FiShield, component: AdminOperations },
  { label: 'Audit log', path: '/admin/audit', icon: FiFileText, component: AdminActivity },
  { label: 'Notifications', path: '/admin/alerts', icon: FiBell, component: AdminActivity },
  { label: 'Reports', path: '/admin/reports', icon: FiFileText, component: AdminReports },
  { label: 'Admin settings', path: '/admin/settings', icon: FiSettings, component: AdminSettings },
]

const pages = { profile: AdminProfile }

export default function AdminHome() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { section } = useParams()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const hideAdminNavigation = section === 'profile'
  const activeItem = navigation.find((item) => item.path === (section ? `/admin/${section}` : '/admin'))
  const Page = pages[section] || activeItem?.component || AdminOverview
  const breadcrumbLabel = section === 'profile' ? 'Profile & security' : activeItem?.label || 'Overview'
  const breadcrumbPath = section ? `/admin/${section}` : '/admin'

  function signOut() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`admin-shell ${hideAdminNavigation ? 'admin-profile-layout' : ''}`}>
      {!hideAdminNavigation && <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''}`}>
        <NavLink to="/admin" className="admin-brand"><span className="admin-brand-icon"><FiCommand /></span><span>finflow<span> / CONTROL</span></span></NavLink>
        <div className="admin-sidebar-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Administration">
          {navigation.map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} end={item.path === '/admin'} className={({ isActive }) => `admin-nav-link ${isActive ? 'admin-nav-active' : ''}`} onClick={() => setSidebarOpen(false)}><Icon /><span>{item.label}</span></NavLink> })}
        </nav>
        <div className="admin-sidebar-spacer" />
        <NavLink to="/dashboard" className="my-finflow-link" onClick={() => setSidebarOpen(false)}><FiCreditCard /><span><strong>Personal finance</strong><small>Open shared workspace</small></span><FiChevronRight className="my-finflow-chevron" /></NavLink>
        <div className="admin-sidebar-footer"><span className="admin-status-dot" /> Admin workspace <span>v1.0</span></div>
      </aside>}
      {!hideAdminNavigation && sidebarOpen && <button className="admin-backdrop" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <div className={`admin-main-column ${hideAdminNavigation ? 'admin-main-wide' : ''}`}>
        <header className="admin-topbar">
          {!hideAdminNavigation && <button className="admin-mobile-menu" type="button" aria-label={sidebarOpen ? 'Close administration navigation' : 'Open administration navigation'} onClick={() => setSidebarOpen((open) => !open)}>{sidebarOpen ? <FiX /> : <FiMenu />}</button>}
          <nav className="admin-breadcrumb" aria-label="Breadcrumb">
            <NavLink to="/admin" end>Admin</NavLink>
            <FiChevronRight aria-hidden="true" />
            <NavLink to={breadcrumbPath} className="admin-breadcrumb-current" aria-current="page">{breadcrumbLabel}</NavLink>
          </nav>
          <div className="admin-top-actions">
            <button className="admin-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? <FiMoon /> : <FiSun />}</button>
            <div className="admin-profile-wrap"><button className="admin-profile-trigger" type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}><span className="admin-avatar">{user?.avatarDataUrl ? <img src={user.avatarDataUrl} alt="" /> : user?.name?.[0]?.toUpperCase()}</span><span>{user?.name}</span><FiChevronDown /></button>{profileOpen && <div className="admin-profile-menu"><span>{user?.email}</span><NavLink to="/admin/profile" onClick={() => setProfileOpen(false)}>Profile & security</NavLink><NavLink to="/dashboard" onClick={() => setProfileOpen(false)}>Open user dashboard</NavLink><button type="button" onClick={signOut}><FiLogOut /> Sign out</button></div>}</div>
          </div>
        </header>
        <main className="admin-content"><Suspense fallback={<div className="admin-loading">Loading workspace view…</div>}><Page /></Suspense></main>
      </div>
    </div>
  )
}