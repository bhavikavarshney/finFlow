export const DEFAULT_CURRENCY = 'INR'

export function formatCurrency(amount, currency = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}