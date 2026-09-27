import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import connectDatabase from './src/config/database.js'
import authRoutes from './src/routes/authRoutes.js'
import adminRoutes from './src/routes/adminRoutes.js'
import financeRoutes from './src/routes/financeRoutes.js'
import { SystemEvent } from './src/models/AdminData.js'

const app = express()
const port = Number(process.env.PORT) || 5000
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const allowedOrigins = new Set([clientOrigin])

if (clientOrigin.includes('localhost')) allowedOrigins.add(clientOrigin.replace('localhost', '127.0.0.1'))
if (clientOrigin.includes('127.0.0.1')) allowedOrigins.add(clientOrigin.replace('127.0.0.1', 'localhost'))

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in backend/.env')
}

app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)) }))
app.use(express.json({ limit: '400kb' }))

const responseTimes = []
const statuses = []
app.locals.metrics = {
  averageResponseTime: () => responseTimes.length ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length) : 0,
  errorRate: () => statuses.length ? Math.round((statuses.filter((status) => status >= 500).length / statuses.length) * 10000) / 100 : 0,
}
app.use((request, response, next) => {
  const startedAt = Date.now()
  response.on('finish', () => {
    const duration = Date.now() - startedAt
    responseTimes.push(duration)
    statuses.push(response.statusCode)
    if (responseTimes.length > 1000) responseTimes.shift()
    if (statuses.length > 1000) statuses.shift()
    if (response.statusCode >= 500 && !request.systemEventLogged) {
      const level = response.statusCode === 503 ? 'warning' : 'error'
      SystemEvent.create({ level, source: request.path.slice(0, 60), message: `Request failed with status ${response.statusCode}.` }).catch(() => {})
    }
  })
  next()
})

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes)

app.use('/api/finance', financeRoutes)
app.use('/api/admin', adminRoutes)

app.use((error, request, response, _next) => {
  console.error(error)
  request.systemEventLogged = true
  SystemEvent.create({ level: 'error', source: 'api', message: 'An unhandled API error occurred.' }).catch(() => {})
  response.status(error.status || 500).json({ message: error.status ? error.message : 'Something went wrong.' })
})

await connectDatabase()
app.listen(port, () => console.log(`finFlow API listening on port ${port}`))