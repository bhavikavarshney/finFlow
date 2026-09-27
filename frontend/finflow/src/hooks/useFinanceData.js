import { useCallback, useEffect, useState } from 'react'
import api from '../utils/api'

export default function useFinanceData() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setError('')
    try {
      const { data: summary } = await api.get('/finance/summary')
      setData(summary)
      return summary
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load your finance data.')
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let current = true
    api.get('/finance/summary')
      .then(({ data: summary }) => { if (current) setData(summary) })
      .catch((requestError) => { if (current) setError(requestError.response?.data?.message || 'Could not load your finance data.') })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [])

  async function create(resource, values) {
    try {
      await api.post(`/finance/${resource}`, values)
      await refresh()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your finance record.')
      throw requestError
    }
  }

  return { data, error, loading, refresh, create }
}
