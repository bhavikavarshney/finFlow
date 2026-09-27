import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Home from './pages/Dashboard/Home'
const AdminHome = lazy(() => import('./pages/Admin/AdminHome'))
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { ThemeProvider } from './context/ThemeContext'

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-stone-500">Checking your session...</div>
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/signup" element={<PublicOnly><SignUp /></PublicOnly>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard/:section?" element={<Home />} />
            </Route>
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin/my-finflow" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin/:section?" element={<Suspense fallback={<div className="admin-loading">Opening admin workspace…</div>}><AdminHome /></Suspense>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}