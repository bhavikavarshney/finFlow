import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Home from './pages/Dashboard/Home'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { ThemeProvider } from './context/ThemeContext'

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-stone-500">Checking your session...</div>
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AdminPage() {
  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <h1 className="text-2xl font-semibold text-stone-900">Admin area</h1>
      <p className="mt-2 text-stone-600">Your administrator role is active.</p>
    </div>
  )
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
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}