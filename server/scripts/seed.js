const { query } = require('../src/config/db')
const { companies, stockPrices, financials, shareholding, newsFeed, resultsCalendar } = require('../src/data/sampleData')

async function seed() {
  console.log('🚀 Starting Database Seed...')

  try {
    // 1. Clear Existing Data (Optional - be careful in production)
    // await query('TRUNCATE portfolio_holdings, portfolios, watchlists, companies, profiles CASCADE')

    // 2. Insert Companies
    console.log('📦 Seeding Companies...')
    for (const company of companies) {
      await query(
        `INSERT INTO companies (symbol, name, exchange, sector, industry, market_cap_category, isin, logo_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (symbol) DO UPDATE SET name = $2`,
        [company.symbol, company.name, company.exchange, company.sector, company.industry, company.marketCapCategory, company.isin, company.logoUrl]
      )
    }

    // 3. Insert Stock Prices
    console.log('📈 Seeding Stock Prices (this may take a moment)...')
    for (const price of stockPrices.slice(-1000)) { // Limit to 1000 for speed
      await query(
        `INSERT INTO stock_prices (symbol, date, open, high, low, close, volume)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (symbol, date) DO NOTHING`,
        [price.symbol, price.date, price.open, price.high, price.low, price.close, price.volume]
      )
    }

    // 4. Insert Results Calendar
    console.log('📅 Seeding Results Calendar...')
    for (const result of resultsCalendar) {
      await query(
        `INSERT INTO results_calendar (symbol, result_date, period, result_type, has_concall, concall_time)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [result.symbol, result.resultDate, result.period, result.resultType, result.hasConcall, result.concallTime]
      )
    }

    console.log('✅ Seed Completed Successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed Failed:', error)
    process.exit(1)
  }
}

seed()
