import { useAuth } from '../context/useAuth'
import { DEFAULT_CURRENCY, formatCurrency } from '../utils/currency'

export default function useCurrency() {
  const { user } = useAuth()
  const currency = user?.currency || DEFAULT_CURRENCY
  return {
    currency,
    formatCurrency: (amount) => formatCurrency(amount, currency),
  }
}