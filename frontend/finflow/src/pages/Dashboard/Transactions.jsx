import { FiArrowDownLeft, FiArrowUpRight, FiCreditCard } from 'react-icons/fi'
import useCurrency from '../../hooks/useCurrency'
import { demoTransactions } from '../../utils/data'

const icons = { card: FiCreditCard, income: FiArrowDownLeft, transport: FiArrowUpRight }

export default function Transactions() {
  const { formatCurrency } = useCurrency()

  return (
    <section className="page-section">
      <header className="page-title-row"><div><span className="eyebrow"><span className="eyebrow-dot" /> YOUR MONEY, IN MOTION</span><h1>Transactions</h1><p>Recent activity across your accounts.</p></div></header>
      <section className="activity-panel transactions-panel"><div className="activity-header"><div><h2>All transactions</h2><p>{demoTransactions.length} sample transactions</p></div></div><div className="transaction-list">{demoTransactions.map((item) => { const Icon = icons[item.icon]; return <article className="activity-item" key={item.id}><span className={`activity-icon ${item.color}`}><Icon /></span><div className="activity-detail"><strong>{item.merchant}</strong><span>{item.category}</span></div><span className="activity-date">{item.date}</span><strong className={`activity-amount ${item.amount > 0 ? 'positive' : ''}`}>{item.amount > 0 ? '+' : '−'}{formatCurrency(Math.abs(item.amount))}</strong></article> })}</div></section>
    </section>
  )
}