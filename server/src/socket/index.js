const { Server } = require('socket.io')
const { env } = require('../config/env')
const LiveMarketService = require('../services/liveMarketService')

function initializeSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    socket.emit('market:hello', { message: 'Connected to Lockbox live market stream' })
    socket.emit('price:update', LiveMarketService.getAllLiveQuotes())
  })

  return io
}

function startPriceTicker(io) {
  setInterval(() => {
    const { updates, timelineEvents, resultEvents } = LiveMarketService.tickLiveQuotes()

    if (updates.length > 0) {
      io.emit('price:update', updates)
    }

    if (timelineEvents.length > 0) {
      io.emit('timeline:update', timelineEvents)
    }

    if (resultEvents.length > 0) {
      io.emit('results:update', resultEvents)
    }
  }, 5000)
}

module.exports = {
  initializeSocketServer,
  startPriceTicker,
}
