import { Link } from 'react-router-dom'
import { FiArrowUpRight, FiCheck, FiTrendingUp } from 'react-icons/fi'
import { formatCurrency } from '../utils/currency'

export default function AuthLayout({ children, mode }) {
  return (
    <main className="auth-page min-h-screen px-5 py-6 sm:px-8 lg:px-12">
      <header className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/login" className="brand-lockup" aria-label="finFlow home">
          <span className="brand-mark">
            <FiTrendingUp size={19} />
          </span>
          <span>
            fin<span className="brand-accent">flow</span>
          </span>
        </Link>
        <Link className="auth-top-link" to={mode === 'login' ? '/signup' : '/login'}>
          {mode === 'login' ? 'Create account' : 'Sign in'} <FiArrowUpRight size={15} />
        </Link>
      </header>

      <section className="auth-grid mx-auto grid max-w-6xl items-center gap-12 py-12 lg:grid-cols-[1fr_0.9fr] lg:gap-24 lg:py-20">
        <div className="auth-story hidden lg:block">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> YOUR MONEY, IN MOTION
          </span>
          <h1>
            Make room for
            <br />
            <span>what matters.</span>
          </h1>
          <p>A calmer view of your money starts with one simple step.</p>
          <div className="preview-panel">
            <div className="preview-heading">
              <span>Monthly overview</span>
              <span className="preview-period">THIS MONTH</span>
            </div>
            <div className="preview-amount">{formatCurrency(4280.5)}</div>
            <div className="preview-caption">
              <span className="preview-trend">
                <FiTrendingUp /> 12.8%
              </span>{' '}
              <span>vs. last month</span>
            </div>
            <div className="preview-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="preview-foot">
              <span>
                <i className="legend-dot income-dot" /> Income
              </span>
              <span>
                <i className="legend-dot spend-dot" /> Spending
              </span>
              <FiCheck className="preview-check" />
            </div>
          </div>
        </div>
        <div className="auth-form-wrap">{children}</div>
      </section>
      <footer className="auth-footer mx-auto max-w-7xl">
        <span>finflow © 2026</span>
        <span>Built for a clearer financial life</span>
      </footer>
    </main>
  )
}
