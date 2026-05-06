const express = require('express');
const market = require('../services/marketDataService');

const router = express.Router();

// GET /api/market/indices  — Live Nifty 50, Sensex, Bank Nifty, IT, Midcap
router.get('/indices', async (req, res) => {
  try {
    const data = await market.getLiveIndices();
    res.json({ data });
  } catch (e) { 
    res.status(500).json({ error: 'Failed to fetch indices' }); 
  }
});

// GET /api/market/gainers  — Top 10 gainers by % change
router.get('/gainers', async (req, res) => {
  try {
    const data = await market.getTopGainers(10);
    res.json({ data });
  } catch (e) { 
    res.status(500).json({ error: 'Failed to fetch gainers' }); 
  }
});

// GET /api/market/losers   — Top 10 losers by % change
router.get('/losers', async (req, res) => {
  try {
    const data = await market.getTopLosers(10);
    res.json({ data });
  } catch (e) { 
    res.status(500).json({ error: 'Failed to fetch losers' }); 
  }
});

// GET /api/market/most-active  — Most active by volume
router.get('/most-active', async (req, res) => {
  try {
    const data = await market.getMostActive(10);
    res.json({ data });
  } catch (e) { 
    res.status(500).json({ error: 'Failed to fetch most active' }); 
  }
});

// GET /api/market/heatmap  — Sector heatmap
router.get('/heatmap', async (req, res) => {
  try {
    const data = await market.getSectorHeatmap();
    res.json({ data });
  } catch (e) { 
    res.status(500).json({ error: 'Failed to fetch heatmap' }); 
  }
});

// GET /api/market/all-stocks — All NSE stocks with live quotes
router.get('/all-stocks', async (req, res) => {
  try {
    const data = await market.getBulkQuotes();
    res.json({ data });
  } catch (e) { 
    res.status(500).json({ error: 'Failed to fetch stocks' }); 
  }
});

module.exports = router;
