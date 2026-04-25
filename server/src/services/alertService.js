const AlertModel = require('../models/Alert')
const StockModel = require('../models/Stock')
const { inMemoryStore } = require('../data/inMemoryStore')

function getVolumeAverage(symbol, lookback = 20) {
  const rows = StockModel.getStockPrices(symbol).slice(-lookback)
  if (rows.length === 0) {
    return 0
  }

  const sum = rows.reduce((total, row) => total + Number(row.volume ?? 0), 0)
  return sum / rows.length
}

function evaluateTriggeredAlerts(liveUpdates) {
  const quoteMap = new Map(liveUpdates.map((quote) => [quote.symbol, quote]))
  const triggered = []

  for (const alert of inMemoryStore.alerts) {
    if (!alert.isActive) {
      continue
    }

    const quote = quoteMap.get(alert.symbol)
    if (!quote) {
      continue
    }

    const threshold = Number(alert.triggerValue)
    const volumeAverage = getVolumeAverage(alert.symbol)

    const isPriceAbove = alert.alertType === 'price_above' && quote.price >= threshold
    const isPriceBelow = alert.alertType === 'price_below' && quote.price <= threshold
    const isVolumeSpike =
      alert.alertType === 'volume_spike' && volumeAverage > 0 && quote.volume >= volumeAverage * (1 + threshold / 100)
    const isWeek52High = alert.alertType === 'week_52_high' && quote.changePercent >= threshold
    const isWeek52Low = alert.alertType === 'week_52_low' && quote.changePercent <= -threshold
    const isRsiSignal = alert.alertType === 'rsi' && Math.abs(quote.changePercent) >= threshold

    if (isPriceAbove || isPriceBelow || isVolumeSpike || isWeek52High || isWeek52Low || isRsiSignal) {
      const now = new Date().toISOString()
      alert.triggeredAt = now

      triggered.push({
        id: alert.id,
        userId: alert.userId,
        symbol: alert.symbol,
        alertType: alert.alertType,
        triggerValue: alert.triggerValue,
        currentPrice: quote.price,
        currentVolume: quote.volume,
        at: now,
      })
    }
  }

  return triggered
}

async function evaluateAlertsForUser(userId) {
  const alerts = await AlertModel.listByUserId(userId)
  const triggered = []

  for (const alert of alerts) {
    if (!alert.isActive) {
      continue
    }

    const symbol = alert.symbol
    const latestPrice = StockModel.getStockPrices(symbol).slice(-1)[0]
    if (!latestPrice) {
      continue
    }

    const isPriceAbove = alert.alertType === 'price_above' && latestPrice.close >= Number(alert.triggerValue)
    const isPriceBelow = alert.alertType === 'price_below' && latestPrice.close <= Number(alert.triggerValue)

    if (isPriceAbove || isPriceBelow) {
      triggered.push({
        alertId: alert.id,
        symbol,
        price: latestPrice.close,
      })
    }
  }

  return triggered
}

module.exports = {
  evaluateAlertsForUser,
  evaluateTriggeredAlerts,
}
