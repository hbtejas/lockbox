const { newsFeed } = require('../data/sampleData')

let lastSyncTimestamp = null

async function syncMarketData() {
  lastSyncTimestamp = new Date().toISOString()
  return {
    synced: true,
    timestamp: lastSyncTimestamp,
    records: newsFeed.length,
  }
}

function getSyncStatus() {
  return {
    lastSyncTimestamp,
  }
}

module.exports = {
  syncMarketData,
  getSyncStatus,
}
