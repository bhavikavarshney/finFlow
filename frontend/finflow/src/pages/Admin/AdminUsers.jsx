import { useEffect, useState } from 'react'
import { FiSearch, FiUserCheck, FiUserX } from 'react-icons/fi'
import api from '../../utils/api'

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
    : 'Never'
}

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ users: [], total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function loadUsers() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users', {
        params: { search, status, page, limit: 10 },
      })
      setResult(data)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let current = true
    api
      .get('/admin/users', { params: { search, status, page, limit: 10 } })
      .then(({ data }) => {
        if (current) setResult(data)
      })
      .catch((requestError) => {
        if (current) setMessage(requestError.response?.data?.message || 'Could not load users.')
      })
      .finally(() => {
        if (current) setLoading(false)
      })
    return () => {
      current = false
    }
  }, [search, status, page])

  async function toggleStatus(user) {
    setMessage('')
    try {
      await api.patch(`/admin/users/${user._id}/status`, {
        status: user.status === 'suspended' ? 'active' : 'suspended',
      })
      setMessage(`${user.name} is now ${user.status === 'suspended' ? 'active' : 'suspended'}.`)
      await loadUsers()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update this account.')
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <div>
          <span className="admin-kicker">CONTROL CENTER / PEOPLE</span>
          <h1>User management</h1>
          <p>Account access and product activity. Financial details are never shown.</p>
        </div>
        <span className="admin-count-chip">{result.total.toLocaleString('en-IN')} accounts</span>
      </header>
      {message && (
        <p className="admin-inline-message" role="status">
          {message}
        </p>
      )}
      <section className="admin-panel admin-users-panel">
        <div className="admin-filter-row">
          <label className="admin-search">
            <FiSearch />
            <input
              aria-label="Search users"
              placeholder="Search name or email"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </label>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Access</th>
                <th>Registered</th>
                <th>Last active</th>
                <th>Transactions</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="admin-table-empty">
                    Loading user accounts…
                  </td>
                </tr>
              ) : result.users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-table-empty">
                    No users match these filters.
                  </td>
                </tr>
              ) : (
                result.users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-user-avatar">{user.name?.[0]?.toUpperCase()}</span>
                        <span>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status-badge status-${user.status || 'active'}`}>
                        <i />
                        {user.status || 'active'}
                      </span>
                      <small className="admin-role-label">{user.role}</small>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastActiveAt)}</td>
                    <td>{user.transactionCount.toLocaleString('en-IN')}</td>
                    <td>
                      <button
                        className={`user-action-button ${user.status === 'suspended' ? 'action-activate' : 'action-suspend'}`}
                        type="button"
                        onClick={() => toggleStatus(user)}
                      >
                        {user.status === 'suspended' ? (
                          <>
                            <FiUserCheck /> Activate
                          </>
                        ) : (
                          <>
                            <FiUserX /> Suspend
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <footer className="admin-pagination">
          <span>
            Page {page} of {result.pages}
          </span>
          <div>
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= result.pages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </div>
        </footer>
      </section>
      <p className="admin-footer-note">
        Transaction count is shown for product usage analysis only. Transaction descriptions,
        amounts, and categories are not accessible here.
      </p>
    </div>
  )
}
