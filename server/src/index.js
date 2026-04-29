const http = require('http')
const { app } = require('./app')
const { env } = require('./config/env')
const { initializeSocketServer, startPriceTicker } = require('./socket')

const server = http.createServer(app)

const io = initializeSocketServer(server)
startPriceTicker(io)

server.listen(env.port, '0.0.0.0', () => {
  console.log(`Server listening on port ${env.port}`)
})
