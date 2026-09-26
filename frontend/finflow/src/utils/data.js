export const demoSummary = {
	balance: 12840.5,
	income: 4320,
	incomeChange: 6.4,
	spending: 1684.32,
	spendingChange: -2.1,
}

export const demoTransactions = [
	{ id: 'tx-1', merchant: 'Weekly groceries', category: 'Food & dining', amount: -84.26, date: 'Today', icon: 'card', color: 'activity-green' },
	{ id: 'tx-2', merchant: 'Salary deposit', category: 'Income', amount: 3200, date: 'Yesterday', icon: 'income', color: 'activity-blue' },
	{ id: 'tx-3', merchant: 'Metro transit', category: 'Transport', amount: -12.5, date: 'Sep 24', icon: 'transport', color: 'activity-orange' },
	{ id: 'tx-4', merchant: 'Electricity bill', category: 'Utilities', amount: -46.8, date: 'Sep 22', icon: 'card', color: 'activity-blue' },
	{ id: 'tx-5', merchant: 'Coffee shop', category: 'Food & dining', amount: -8.4, date: 'Sep 21', icon: 'card', color: 'activity-orange' },
]

export const demoBudgets = [
	{ category: 'Food & dining', spent: 840, limit: 1200, color: 'budget-green' },
	{ category: 'Transport', spent: 319.32, limit: 700, color: 'budget-blue' },
	{ category: 'Shopping', spent: 525, limit: 600, color: 'budget-orange' },
]

export const demoReportCategories = [
	{ category: 'Food & dining', amount: 840, share: 50 },
	{ category: 'Shopping', amount: 525, share: 31 },
	{ category: 'Transport', amount: 319.32, share: 19 },
]
