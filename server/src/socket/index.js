const { Server } = require('socket.io')
const { env } = require('../config/env')
const { getLiveQuote } = require('../services/marketDataService')

// We will store which symbols each socket is interested in: socketId -> Set<symbol>
const subscriptions = new Map()
// Keep track of socket objects for direct emission
const activeSockets = new Map()

function initializeSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: [env.clientUrl, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    activeSockets.set(socket.id, socket)
    socket.emit('market:hello', { message: 'Connected to Lockbox live market stream' })

    socket.on('subscribe', (symbols) => {
      if (Array.isArray(symbols)) {
        subscriptions.set(socket.id, new Set(symbols))
      }
    })

    socket.on('disconnect', () => {
      subscriptions.delete(socket.id)
      activeSockets.delete(socket.id)
    })
  })

  return io
}

function startPriceTicker(io) {
  setInterval(async () => {
    const allSymbols = new Set()
    subscriptions.forEach(symbols => symbols.forEach(s => allSymbols.add(s)))
    if (allSymbols.size === 0) return

    for (const symbol of allSymbols) {
      try {
        const quote = await getLiveQuote(symbol)
        
        subscriptions.forEach((symbols, socketId) => {
          if (symbols.has(symbol)) {
            const socket = activeSockets.get(socketId)
            if (socket) {
              socket.emit('price:update', [{
                symbol,
                price:         quote.price,
                change:        quote.change,
                changePercent: quote.changePercent,
                volume:        quote.volume,
                high:          quote.high,
                low:           quote.low,
                at:            new Date().toISOString(),
              }])
            }
          }
        })
      } catch (err) {}
    }
  }, env.priceTickerInterval || 10000)
}

module.exports = {
  initializeSocketServer,
  startPriceTicker,
}
