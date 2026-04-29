const { Server } = require('socket.io')
const { env } = require('../config/env')
const LiveMarketService = require('../services/liveMarketService')

function initializeSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: [env.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    socket.emit('market:hello', { message: 'Connected to Lockbox live market stream' })
    socket.emit('price:update', LiveMarketService.getAllLiveQuotes())
  })

  return io
}

const { getSupabase } = require('../lib/supabase')

function startPriceTicker(io) {
  setInterval(async () => {
    const { updates, timelineEvents, resultEvents } = LiveMarketService.tickLiveQuotes()
    const supabase = getSupabase()

    if (updates.length > 0) {
      io.emit('price:update', updates)

      // FIX #9 — UPSERT into Supabase to trigger Realtime on frontend
      if (supabase) {
        const dbUpdates = updates.map(u => ({
          symbol: u.symbol,
          price: u.price,
          change_pct: u.changePercent,
          volume: u.volume,
          updated_at: u.at
        }))

        const { error } = await supabase
          .from('live_prices')
          .upsert(dbUpdates, { onConflict: 'symbol' })

        if (error) console.error('[PriceTicker] Supabase upsert error:', error.message)
      }
    }

    if (timelineEvents.length > 0) {
      io.emit('timeline:update', timelineEvents)
    }

    if (resultEvents.length > 0) {
      io.emit('results:update', resultEvents)

      if (supabase) {
        const dbResults = resultEvents.map(r => ({
          symbol: r.symbol,
          result_date: r.resultDate,
          period: r.period,
          result_type: r.resultType,
          has_concall: r.hasConcall,
          concall_time: r.concallTime,
          estimate_revenue: r.estimateRevenue,
          actual_revenue: r.actualRevenue,
          estimate_pat: r.estimatePat,
          actual_pat: r.actualPat,
          estimate_eps: r.estimateEps,
          actual_eps: r.actualEps
        }))

        const { error } = await supabase
          .from('results_calendar')
          .upsert(dbResults)

        if (error) console.error('[PriceTicker] Results upsert error:', error.message)
      }
    }
  }, env.priceTickerInterval)
}

module.exports = {
  initializeSocketServer,
  startPriceTicker,
}
