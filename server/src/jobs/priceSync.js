const cron = require('node-cron');
const { syncPricesToDB } = require('../services/marketDataService');

// Market hours IST: 9:15 AM - 3:30 PM Mon-Fri
// Run sync every 5 minutes during market hours
// '*/5 9-15 * * 1-5' = every 5 min from 9am to 3pm on weekdays

function startPriceSyncJob() {
  // Sync on startup
  syncPricesToDB().catch(console.error);

  // Sync every 5 minutes during market hours (IST = UTC+5:30, so UTC 3:45–10:00)
  cron.schedule('*/5 3-10 * * 1-5', () => {
    syncPricesToDB().catch(console.error);
  });

  // End of day final sync at 4 PM IST
  cron.schedule('30 10 * * 1-5', () => {
    syncPricesToDB().catch(console.error);
  });

  console.log('[PriceSync] Scheduled jobs started.');
}

module.exports = {
  startPriceSyncJob
};
