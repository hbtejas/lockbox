const cors = require('cors')
const cookieParser = require('cookie-parser')
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const { registerRoutes } = require('./routes')
const { env } = require('./config/env')
const { healthCheck } = require('./config/db')
const { apiRateLimiter, authRateLimiter } = require('./middleware/rateLimit')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')

const app = express()

app.use(
  cors({
    origin: [
      env.clientUrl,
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRateLimiter)
app.use('/api', apiRateLimiter)

app.get('/health', async (_req, res) => {
  const db = await healthCheck()
  return res.status(200).json({
    success: true,
    service: 'lockbox-server',
    environment: env.nodeEnv,
    database: db,
    timestamp: new Date().toISOString(),
  })
})

registerRoutes(app)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = { app }
