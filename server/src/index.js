const http = require('http')
const { app } = require('./app')
const { env } = require('./config/env')
const { initializeSocketServer, startPriceTicker } = require('./socket')
const { startPriceSyncJob } = require('./jobs/priceSync')

const server = http.createServer(app)

const io = initializeSocketServer(server)
startPriceTicker(io)

// Start cron jobs
startPriceSyncJob()

server.listen(env.port, '0.0.0.0', () => {
  console.log(`Server listening on port ${env.port}`)
})
