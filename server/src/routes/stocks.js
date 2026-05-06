const express = require('express');
const market = require('../services/marketDataService');

const router = express.Router();

// GET /api/stocks/search?q=RELIANCE
router.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q || q.length < 1) return res.json({ data: [] });
  try {
    const results = await market.searchStocks(q);
    res.json({ data: results });
  } catch (e) { 
    res.status(500).json({ error: 'Search failed' }); 
  }
});

// GET /api/stocks/:symbol  — Full stock overview
router.get('/:symbol', async (req, res) => {
  try {
    const data = await market.getStockOverview(req.params.symbol);
    res.json({ data });
  } catch (e) { 
    res.status(500).json({ error: 'Stock not found' }); 
  }
});

// GET /api/stocks/:symbol/quote  — Just the live price
router.get('/:symbol/quote', async (req, res) => {
  try {
    const data = await market.getLiveQuote(req.params.symbol);
    res.json({ data });
  } catch (e) { 
    res.status(500).json({ error: 'Quote failed' }); 
  }
});

// GET /api/stocks/:symbol/price  — OHLCV chart data (Changed to match stockApi.ts expects /price)
router.get('/:symbol/price', async (req, res) => {
  const period = req.query.period || '1y';
  try {
    const data = await market.getHistoricalData(req.params.symbol, period);
    res.json({ data });
  } catch (e) { 
    res.status(500).json({ error: 'History fetch failed' }); 
  }
});

module.exports = router;
