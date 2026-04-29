const stockRoutes = require('./stocks')
const marketRoutes = require('./market')
const screenerRoutes = require('./screener')
const portfolioRoutes = require('./portfolio')
const watchlistRoutes = require('./watchlist')
const alertsRoutes = require('./alerts')
const ideasRoutes = require('./ideas')
const macroRoutes = require('./macro')
const timelineRoutes = require('./timeline')
const billingRoutes = require('./billing')
const resultsRoutes = require('./results')
const aiRoutes = require('./ai')
const MacroController = require('../controllers/macroController')

function registerRoutes(app) {
  app.use('/api/stocks', stockRoutes)
  app.use('/api/market', marketRoutes)
  app.use('/api/screener', screenerRoutes)
  app.use('/api/portfolio', portfolioRoutes)
  app.use('/api/watchlist', watchlistRoutes)
  app.use('/api/alerts', alertsRoutes)
  app.use('/api/ideas', ideasRoutes)
  app.use('/api/macro', macroRoutes)
  app.get('/api/raw-materials', MacroController.getRawMaterials)
  app.use('/api/timeline', timelineRoutes)
  app.use('/api/results', resultsRoutes)
  app.use('/api/billing', billingRoutes)
  app.use('/api/ai', aiRoutes)
}

module.exports = {
  registerRoutes,
}
