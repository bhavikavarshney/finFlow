import { useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { FiChevronDown, FiLogOut, FiMenu, FiMoon, FiSun, FiTrendingUp, FiX } from 'react-icons/fi'
import { useAuth } from '../../context/useAuth'
import useTheme from '../../context/useTheme'
import Overview from './Overview'
import Accounts from './Accounts'
import Transactions from './Transactions'
import Budgets from './Budgets'
import Reports from './Reports'
import Settings from './Settings'

const financeSections = [
  { label: 'Transactions', path: '/dashboard/transactions' },
  { label: 'Budgets', path: '/dashboard/budgets' },
  { label: 'Reports', path: '/dashboard/reports' },
]

const pages = {
  accounts: Accounts,
  transactions: Transactions,
  budgets: Budgets,
  reports: Reports,
  settings: Settings,
}

export default function Home() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { section } = useParams()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const Page = section ? pages[section] || Overview : Overview
  const isFinanceSection = financeSections.some((item) => item.path === `/dashboard/${section}`)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashboard-page min-h-screen">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <NavLink to="/dashboard" className="brand-lockup" aria-label="finflow dashboard">
            <span className="brand-mark">
              <FiTrendingUp size={19} />
            </span>
            <span>
              fin<span className="brand-accent">flow</span>
            </span>
          </NavLink>
          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileNavOpen ? <FiX /> : <FiMenu />}
          </button>
          <nav
            className={`dashboard-tabs ${mobileNavOpen ? 'dashboard-tabs-open' : ''}`}
            aria-label="Main navigation"
          >
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => `dashboard-tab ${isActive ? 'tab-active' : ''}`}
              onClick={() => setMobileNavOpen(false)}
            >
              Overview
            </NavLink>
            <NavLink
              to="/dashboard/accounts"
              className={({ isActive }) => `dashboard-tab ${isActive ? 'tab-active' : ''}`}
              onClick={() => setMobileNavOpen(false)}
            >
              Accounts
            </NavLink>
            <NavLink
              to="/dashboard/transactions"
              className={`dashboard-tab ${isFinanceSection ? 'tab-active' : ''}`}
              onClick={() => setMobileNavOpen(false)}
            >
              Finances
            </NavLink>
          </nav>
          <div className="header-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </button>
            <div className="profile-wrap">
              <button
                className="profile-button"
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
              >
                <span className="profile-avatar">
                  {user?.avatarDataUrl ? (
                    <img src={user.avatarDataUrl} alt="" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase()
                  )}
                </span>
                <span className="profile-name">{user?.name}</span>
                <FiChevronDown className="profile-chevron" />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <span className="profile-email">{user?.email}</span>
                  <span className="profile-currency">Currency · {user?.currency || 'INR'}</span>
                  <NavLink to="/dashboard/settings" onClick={() => setProfileOpen(false)}>
                    Settings
                  </NavLink>
                  {user?.role === 'admin' && (
                    <NavLink to="/admin" onClick={() => setProfileOpen(false)}>
                      Admin area
                    </NavLink>
                  )}
                  <button type="button" onClick={handleLogout}>
                    <FiLogOut /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {isFinanceSection && (
          <nav className="finance-subnav finance-subnav-open" aria-label="Finance pages">
            {financeSections.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `finance-subnav-link ${isActive ? 'finance-subnav-active' : ''}`
                }
                onClick={() => setMobileNavOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="dashboard-main">
        <Page />
      </main>
      <footer className="dashboard-footer">
        <span>finflow</span>
        <span>A little more clarity, every day.</span>
      </footer>
    </div>
  )
}
