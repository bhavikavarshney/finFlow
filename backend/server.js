import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import connectDatabase from './src/config/database.js'
import authRoutes from './src/routes/authRoutes.js'
import { requireAuth, requireRole } from './src/middleware/auth.js'

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

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes)

app.get('/api/admin/overview', requireAuth, requireRole('admin'), (_request, response) => {
  response.json({ message: 'Admin access granted.' })
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(error.status || 500).json({ message: error.status ? error.message : 'Something went wrong.' })
})

await connectDatabase()
app.listen(port, () => console.log(`finFlow API listening on port ${port}`))