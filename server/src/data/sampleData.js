const dayjs = require('dayjs')

const companies = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', sector: 'Energy', industry: 'Oil & Gas', marketCapCategory: 'large', currentPrice: 2968, changePercent: 1.92, marketCap: 2005000, peRatio: 24.1, pbRatio: 2.2, dividendYield: 0.34, beta: 1.06, week52High: 3120, week52Low: 2221, description: 'Reliance Industries is one of Indias largest conglomerates with businesses in energy, digital services (Jio), and retail.' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'Information Technology', industry: 'IT Services', marketCapCategory: 'large', currentPrice: 4255, changePercent: -0.72, marketCap: 1542000, peRatio: 29.3, pbRatio: 12.6, dividendYield: 1.18, beta: 0.84, week52High: 4595, week52Low: 3311, description: 'TCS provides IT services, consulting, and enterprise solutions globally.' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', sector: 'Banking', industry: 'Private Banks', marketCapCategory: 'large', currentPrice: 1842, changePercent: 0.55, marketCap: 1400000, peRatio: 19.8, pbRatio: 3.1, dividendYield: 1.1, beta: 0.92, week52High: 1950, week52Low: 1420, description: 'HDFC Bank is Indias largest private sector bank by market capitalization.' },
  { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', sector: 'Information Technology', industry: 'IT Services', marketCapCategory: 'large', currentPrice: 1890, changePercent: -0.38, marketCap: 785000, peRatio: 28.5, pbRatio: 8.4, dividendYield: 2.1, beta: 0.78, week52High: 2050, week52Low: 1350, description: 'Infosys is a global leader in next-generation digital services and consulting.' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', sector: 'Banking', industry: 'Private Banks', marketCapCategory: 'large', currentPrice: 1295, changePercent: 0.82, marketCap: 910000, peRatio: 17.2, pbRatio: 3.4, dividendYield: 0.82, beta: 1.05, week52High: 1380, week52Low: 980, description: 'ICICI Bank is one of Indias leading private sector banks with diversified financial services.' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', exchange: 'NSE', sector: 'FMCG', industry: 'Consumer Goods', marketCapCategory: 'large', currentPrice: 2510, changePercent: -0.22, marketCap: 590000, peRatio: 55.2, pbRatio: 11.8, dividendYield: 1.6, beta: 0.42, week52High: 2860, week52Low: 2172, description: 'HUL is Indias largest FMCG company with brands like Dove, Surf Excel, and Lux.' },
  { symbol: 'ITC', name: 'ITC Ltd', exchange: 'NSE', sector: 'FMCG', industry: 'Tobacco & Consumer', marketCapCategory: 'large', currentPrice: 468, changePercent: 0.65, marketCap: 582000, peRatio: 27.8, pbRatio: 7.9, dividendYield: 2.8, beta: 0.58, week52High: 510, week52Low: 395, description: 'ITC is a diversified conglomerate with businesses in FMCG, hotels, agri-business, and IT.' },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking', industry: 'Public Banks', marketCapCategory: 'large', currentPrice: 825, changePercent: 1.12, marketCap: 736000, peRatio: 10.2, pbRatio: 1.8, dividendYield: 1.7, beta: 1.22, week52High: 912, week52Low: 600, description: 'SBI is Indias largest public sector bank with nationwide presence.' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', exchange: 'NSE', sector: 'Telecom', industry: 'Telecom Services', marketCapCategory: 'large', currentPrice: 1680, changePercent: 0.95, marketCap: 950000, peRatio: 75.4, pbRatio: 8.2, dividendYield: 0.48, beta: 0.72, week52High: 1780, week52Low: 1200, description: 'Bharti Airtel is Indias second largest telecom operator with operations across Asia and Africa.' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', exchange: 'NSE', sector: 'Banking', industry: 'Private Banks', marketCapCategory: 'large', currentPrice: 1935, changePercent: -0.15, marketCap: 385000, peRatio: 21.5, pbRatio: 3.2, dividendYield: 0.1, beta: 0.95, week52High: 2070, week52Low: 1630, description: 'Kotak Mahindra Bank is a leading Indian private sector bank.' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', exchange: 'NSE', sector: 'Infrastructure', industry: 'Engineering & Construction', marketCapCategory: 'large', currentPrice: 3620, changePercent: 0.42, marketCap: 498000, peRatio: 32.8, pbRatio: 5.6, dividendYield: 0.8, beta: 1.15, week52High: 3900, week52Low: 2880, description: 'L&T is Indias largest engineering and construction conglomerate.' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', exchange: 'NSE', sector: 'Consumer Durables', industry: 'Paints', marketCapCategory: 'large', currentPrice: 2845, changePercent: -0.68, marketCap: 273000, peRatio: 52.1, pbRatio: 15.2, dividendYield: 0.7, beta: 0.65, week52High: 3395, week52Low: 2390, description: 'Asian Paints is Indias leading paint company with presence across decorative and industrial coatings.' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', exchange: 'NSE', sector: 'Banking', industry: 'Private Banks', marketCapCategory: 'large', currentPrice: 1172, changePercent: 0.33, marketCap: 362000, peRatio: 14.5, pbRatio: 2.3, dividendYield: 0.09, beta: 1.18, week52High: 1340, week52Low: 995, description: 'Axis Bank is the third largest private sector bank in India.' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', exchange: 'NSE', sector: 'Automobile', industry: 'Passenger Vehicles', marketCapCategory: 'large', currentPrice: 12450, changePercent: 0.78, marketCap: 390000, peRatio: 28.9, pbRatio: 5.8, dividendYield: 0.72, beta: 0.88, week52High: 13680, week52Low: 9820, description: 'Maruti Suzuki is Indias largest passenger car manufacturer.' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', exchange: 'NSE', sector: 'Pharmaceuticals', industry: 'Drug Manufacturers', marketCapCategory: 'large', currentPrice: 1628, changePercent: 0.41, marketCap: 391000, peRatio: 35.2, pbRatio: 6.1, dividendYield: 0.8, beta: 0.75, week52High: 1708, week52Low: 1092, description: 'Sun Pharma is among the largest specialty generic pharmaceutical companies.' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', exchange: 'NSE', sector: 'Automobile', industry: 'Vehicles', marketCapCategory: 'large', currentPrice: 780, changePercent: 1.45, marketCap: 290000, peRatio: 8.5, pbRatio: 3.8, dividendYield: 0.3, beta: 1.48, week52High: 1065, week52Low: 620, description: 'Tata Motors is a leading global automobile manufacturer including Jaguar Land Rover.' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', exchange: 'NSE', sector: 'Information Technology', industry: 'IT Services', marketCapCategory: 'large', currentPrice: 295, changePercent: -0.51, marketCap: 308000, peRatio: 24.8, pbRatio: 3.9, dividendYield: 0.2, beta: 0.82, week52High: 320, week52Low: 208, description: 'Wipro is a leading global IT, consulting, and business process services company.' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', exchange: 'NSE', sector: 'Information Technology', industry: 'IT Services', marketCapCategory: 'large', currentPrice: 1870, changePercent: 0.28, marketCap: 508000, peRatio: 26.4, pbRatio: 7.2, dividendYield: 3.2, beta: 0.76, week52High: 2020, week52Low: 1350, description: 'HCL Tech is a leading global IT services company.' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', exchange: 'NSE', sector: 'Financial Services', industry: 'NBFC', marketCapCategory: 'large', currentPrice: 7250, changePercent: 0.92, marketCap: 449000, peRatio: 30.5, pbRatio: 6.8, dividendYield: 0.4, beta: 1.32, week52High: 8190, week52Low: 5950, description: 'Bajaj Finance is Indias largest non-banking financial company by market cap.' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', exchange: 'NSE', sector: 'Metals', industry: 'Steel', marketCapCategory: 'large', currentPrice: 162, changePercent: 1.85, marketCap: 202000, peRatio: 58.2, pbRatio: 2.1, dividendYield: 2.2, beta: 1.45, week52High: 185, week52Low: 119, description: 'Tata Steel is one of the worlds largest steel companies.' },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd', exchange: 'NSE', sector: 'Defence', industry: 'Aerospace & Defence', marketCapCategory: 'large', currentPrice: 4572, changePercent: 2.67, marketCap: 305000, peRatio: 34.8, pbRatio: 10.1, dividendYield: 0.6, beta: 1.1, week52High: 4898, week52Low: 1688, description: 'HAL is a leading aerospace and defence manufacturing company in India.' },
  { symbol: 'TITAN', name: 'Titan Company Ltd', exchange: 'NSE', sector: 'Consumer Durables', industry: 'Jewellery & Watches', marketCapCategory: 'large', currentPrice: 3580, changePercent: -0.35, marketCap: 318000, peRatio: 85.2, pbRatio: 17.5, dividendYield: 0.3, beta: 0.92, week52High: 3890, week52Low: 2960, description: 'Titan is Indias leading lifestyle company with brands like Tanishq and Fastrack.' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', exchange: 'NSE', sector: 'FMCG', industry: 'Food Products', marketCapCategory: 'large', currentPrice: 2380, changePercent: 0.12, marketCap: 229000, peRatio: 72.5, pbRatio: 68.2, dividendYield: 1.4, beta: 0.35, week52High: 2778, week52Low: 2110, description: 'Nestle India is a leading food and beverages company with brands like Maggi and Nescafe.' },
  { symbol: 'POWERGRID', name: 'Power Grid Corp of India', exchange: 'NSE', sector: 'Power', industry: 'Power Transmission', marketCapCategory: 'large', currentPrice: 315, changePercent: 0.48, marketCap: 293000, peRatio: 17.8, pbRatio: 2.9, dividendYield: 3.8, beta: 0.68, week52High: 365, week52Low: 250, description: 'Power Grid Corporation operates the largest power transmission network in India.' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', exchange: 'NSE', sector: 'Conglomerate', industry: 'Diversified', marketCapCategory: 'large', currentPrice: 3180, changePercent: 2.15, marketCap: 363000, peRatio: 78.5, pbRatio: 9.2, dividendYield: 0.04, beta: 1.65, week52High: 3740, week52Low: 2050, description: 'Adani Enterprises is the flagship company of the Adani Group.' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', exchange: 'NSE', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCapCategory: 'large', currentPrice: 1540, changePercent: 0.85, marketCap: 370000, peRatio: 32.4, pbRatio: 5.8, dividendYield: 0.8, beta: 0.72, week52High: 1650, week52Low: 1100, description: 'Sun Pharma is a leading global specialty generic pharmaceutical company.' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', exchange: 'NSE', sector: 'Materials', industry: 'Cement', marketCapCategory: 'large', currentPrice: 9850, changePercent: 0.45, marketCap: 285000, peRatio: 42.1, pbRatio: 4.8, dividendYield: 0.5, beta: 0.95, week52High: 10500, week52Low: 7500, description: 'UltraTech is the largest manufacturer of grey cement and ready-mix concrete in India.' },
  { symbol: 'TITAN', name: 'Titan Company Ltd', exchange: 'NSE', sector: 'Consumer Discretionary', industry: 'Jewellery', marketCapCategory: 'large', currentPrice: 3420, changePercent: -0.65, marketCap: 305000, peRatio: 82.5, pbRatio: 18.4, dividendYield: 0.3, beta: 0.88, week52High: 3850, week52Low: 2800, description: 'Titan is a leading lifestyle company in India with strong presence in jewellery and watches.' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', exchange: 'NSE', sector: 'Automotive', industry: 'Automobiles', marketCapCategory: 'large', currentPrice: 2045, changePercent: 1.15, marketCap: 255000, peRatio: 18.2, pbRatio: 3.5, dividendYield: 1.0, beta: 1.25, week52High: 2150, week52Low: 1450, description: 'M&M is a leading automobile and farm equipment manufacturer in India.' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd', exchange: 'NSE', sector: 'Industrials', industry: 'Transportation', marketCapCategory: 'large', currentPrice: 1320, changePercent: 1.85, marketCap: 285000, peRatio: 35.4, pbRatio: 5.2, dividendYield: 0.6, beta: 1.42, week52High: 1450, week52Low: 850, description: 'Adani Ports is Indias largest private port operator and logistics company.' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', exchange: 'NSE', sector: 'Automotive', industry: 'Automobiles', marketCapCategory: 'large', currentPrice: 8940, changePercent: 0.95, marketCap: 250000, peRatio: 34.2, pbRatio: 8.4, dividendYield: 1.5, beta: 0.75, week52High: 9500, week52Low: 5800, description: 'Bajaj Auto is a leading manufacturer of motorcycles and three-wheelers.' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', exchange: 'NSE', sector: 'Materials', industry: 'Steel', marketCapCategory: 'large', currentPrice: 845, changePercent: 1.25, marketCap: 205000, peRatio: 15.8, pbRatio: 2.5, dividendYield: 0.8, beta: 1.35, week52High: 920, week52Low: 680, description: 'JSW Steel is a leading integrated steel manufacturer in India.' },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd', exchange: 'NSE', sector: 'Materials', industry: 'Diversified', marketCapCategory: 'large', currentPrice: 2280, changePercent: 0.55, marketCap: 155000, peRatio: 24.5, pbRatio: 1.8, dividendYield: 0.6, beta: 1.12, week52High: 2450, week52Low: 1750, description: 'Grasim is the flagship company of the Aditya Birla Group with interests in VSF and chemicals.' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', exchange: 'NSE', sector: 'Materials', industry: 'Aluminium', marketCapCategory: 'large', currentPrice: 585, changePercent: 1.65, marketCap: 132000, peRatio: 12.8, pbRatio: 1.4, dividendYield: 0.9, beta: 1.55, week52High: 650, week52Low: 420, description: 'Hindalco is the worlds largest aluminium rolling company and a major producer of copper.' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', exchange: 'NSE', sector: 'Materials', industry: 'Steel', marketCapCategory: 'large', currentPrice: 154, changePercent: 1.35, marketCap: 192000, peRatio: 52.4, pbRatio: 1.9, dividendYield: 2.4, beta: 1.48, week52High: 175, week52Low: 110, description: 'Tata Steel is one of the worlds most geographically diversified steel producers.' },
  { symbol: 'CIPLA', name: 'Cipla Ltd', exchange: 'NSE', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCapCategory: 'large', currentPrice: 1420, changePercent: 0.75, marketCap: 115000, peRatio: 28.5, pbRatio: 4.8, dividendYield: 0.8, beta: 0.65, week52High: 1550, week52Low: 1050, description: 'Cipla is a leading global pharmaceutical company based in India.' },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories Ltd', exchange: 'NSE', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCapCategory: 'large', currentPrice: 3850, changePercent: 1.25, marketCap: 102000, peRatio: 64.2, pbRatio: 8.5, dividendYield: 0.6, beta: 0.78, week52High: 4200, week52Low: 3200, description: 'Divis Labs is a leading manufacturer of API and intermediates.' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', exchange: 'NSE', sector: 'Energy', industry: 'Coal', marketCapCategory: 'large', currentPrice: 445, changePercent: 0.85, marketCap: 275000, peRatio: 8.5, pbRatio: 4.2, dividendYield: 6.5, beta: 0.82, week52High: 485, week52Low: 280, description: 'Coal India is the largest coal producer in the world.' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corp Ltd', exchange: 'NSE', sector: 'Energy', industry: 'Oil & Gas', marketCapCategory: 'large', currentPrice: 610, changePercent: 0.45, marketCap: 132000, peRatio: 4.5, pbRatio: 1.8, dividendYield: 5.8, beta: 0.95, week52High: 680, week52Low: 350, description: 'BPCL is a major government-owned oil and gas corporation.' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp Ltd', exchange: 'NSE', sector: 'Energy', industry: 'Oil & Gas', marketCapCategory: 'large', currentPrice: 285, changePercent: 1.15, marketCap: 358000, peRatio: 7.8, pbRatio: 1.2, dividendYield: 4.2, beta: 1.15, week52High: 310, week52Low: 160, description: 'ONGC is Indias largest crude oil and natural gas company.' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Co Ltd', exchange: 'NSE', sector: 'Financial Services', industry: 'Insurance', marketCapCategory: 'large', currentPrice: 1480, changePercent: 0.65, marketCap: 148000, peRatio: 78.5, pbRatio: 12.4, dividendYield: 0.2, beta: 0.68, week52High: 1650, week52Low: 1150, description: 'SBI Life is one of Indias leading private life insurance companies.' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Co Ltd', exchange: 'NSE', sector: 'Financial Services', industry: 'Insurance', marketCapCategory: 'large', currentPrice: 625, changePercent: -0.45, marketCap: 134000, peRatio: 84.2, pbRatio: 10.8, dividendYield: 0.3, beta: 0.75, week52High: 720, week52Low: 550, description: 'HDFC Life is a leading long-term life insurance solutions provider.' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', exchange: 'NSE', sector: 'Information Technology', industry: 'IT Services', marketCapCategory: 'large', currentPrice: 485, changePercent: -1.25, marketCap: 254000, peRatio: 22.4, pbRatio: 3.4, dividendYield: 0.2, beta: 0.85, week52High: 540, week52Low: 380, description: 'Wipro is a leading global information technology, consulting and business process services company.' },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', exchange: 'NSE', sector: 'Information Technology', industry: 'IT Services', marketCapCategory: 'large', currentPrice: 1240, changePercent: 0.35, marketCap: 120000, peRatio: 45.2, pbRatio: 4.1, dividendYield: 4.0, beta: 0.92, week52High: 1450, week52Low: 1050, description: 'Tech Mahindra is a leading provider of digital transformation and IT services.' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', exchange: 'NSE', sector: 'FMCG', industry: 'Food Products', marketCapCategory: 'large', currentPrice: 2540, changePercent: 0.25, marketCap: 245000, peRatio: 82.4, pbRatio: 85.2, dividendYield: 1.2, beta: 0.35, week52High: 2750, week52Low: 2150, description: 'Nestle India is a subsidiary of Nestlé S.A. of Switzerland and is a leading food products company.' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', exchange: 'NSE', sector: 'FMCG', industry: 'Food Products', marketCapCategory: 'large', currentPrice: 4850, changePercent: 0.85, marketCap: 116000, peRatio: 52.4, pbRatio: 45.8, dividendYield: 1.5, beta: 0.45, week52High: 5400, week52Low: 4200, description: 'Britannia is one of Indias leading food companies with famous biscuit brands.' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', exchange: 'NSE', sector: 'Automotive', industry: 'Automobiles', marketCapCategory: 'large', currentPrice: 4150, changePercent: 1.65, marketCap: 114000, peRatio: 32.5, pbRatio: 6.8, dividendYield: 0.9, beta: 1.05, week52High: 4500, week52Low: 3100, description: 'Eicher Motors is the parent company of Royal Enfield, the global leader in middleweight motorcycles.' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd', exchange: 'NSE', sector: 'Healthcare', industry: 'Hospitals', marketCapCategory: 'large', currentPrice: 6240, changePercent: 0.55, marketCap: 89000, peRatio: 92.4, pbRatio: 14.5, dividendYield: 0.3, beta: 0.72, week52High: 6800, week52Low: 4800, description: 'Apollo Hospitals is the largest integrated healthcare network in India.' },
]

const stockPrices = Array.from({ length: 365 }).flatMap((_, index) => {
  const date = dayjs().subtract(364 - index, 'day').format('YYYY-MM-DD')
  return companies.map((company) => {
    const move = Math.sin(index / 14) * 0.04 + index / 2000
    const close = Number((company.currentPrice * (0.82 + move)).toFixed(2))
    return {
      symbol: company.symbol,
      date,
      open: Number((close * 0.995).toFixed(2)),
      high: Number((close * 1.012).toFixed(2)),
      low: Number((close * 0.985).toFixed(2)),
      close,
      volume: 700000 + index * 3000,
    }
  })
})

const financials = companies.flatMap((company) => [
  { symbol: company.symbol, periodType: 'Q', periodEnd: '2025-03-31', revenue: 267000, netProfit: 18800, ebitda: 41200, eps: 13.8, grossMargin: 0.41, netMargin: 0.13, roce: 0.182, roe: 0.111, debtToEquity: 0.45, operatingCashFlow: 38000, capex: 22000, freeCashFlow: 16000 },
  { symbol: company.symbol, periodType: 'Q', periodEnd: '2024-12-31', revenue: 261120, netProfit: 17560, ebitda: 39950, eps: 13.1, grossMargin: 0.4, netMargin: 0.125, roce: 0.176, roe: 0.109, debtToEquity: 0.46, operatingCashFlow: 36210, capex: 21480, freeCashFlow: 14730 },
  { symbol: company.symbol, periodType: 'A', periodEnd: '2025-03-31', revenue: 1034200, netProfit: 69200, ebitda: 154100, eps: 51.7, grossMargin: 0.412, netMargin: 0.128, roce: 0.174, roe: 0.108, debtToEquity: 0.44, operatingCashFlow: 142200, capex: 85800, freeCashFlow: 56400 },
  { symbol: company.symbol, periodType: 'A', periodEnd: '2024-03-31', revenue: 982300, netProfit: 65020, ebitda: 146850, eps: 48.3, grossMargin: 0.406, netMargin: 0.122, roce: 0.167, roe: 0.102, debtToEquity: 0.46, operatingCashFlow: 134900, capex: 80220, freeCashFlow: 54680 },
])

const shareholding = companies.flatMap((company) => [
  { symbol: company.symbol, quarter: '2024-06-30', promoterHolding: 50.3, fiiHolding: 24.8, diiHolding: 13.1, mutualFundHolding: 8.2, retailHolding: 11.8 },
  { symbol: company.symbol, quarter: '2024-09-30', promoterHolding: 50.2, fiiHolding: 25.1, diiHolding: 13.3, mutualFundHolding: 8.3, retailHolding: 11.4 },
  { symbol: company.symbol, quarter: '2024-12-31', promoterHolding: 50.1, fiiHolding: 25.6, diiHolding: 13.4, mutualFundHolding: 8.4, retailHolding: 10.9 },
  { symbol: company.symbol, quarter: '2025-03-31', promoterHolding: 50.1, fiiHolding: 26.2, diiHolding: 13.9, mutualFundHolding: 8.6, retailHolding: 10.2 },
])

const sectorIndices = [
  { indexName: 'Nifty Bank', sector: 'Banking', oneDay: 0.7, oneWeek: 1.8, oneMonth: 4.5, sixMonths: 14.2, oneYear: 22.1 },
  { indexName: 'Nifty IT', sector: 'Information Technology', oneDay: -0.3, oneWeek: 0.9, oneMonth: 2.1, sixMonths: 8.4, oneYear: 15.6 },
  { indexName: 'Nifty Pharma', sector: 'Pharmaceuticals', oneDay: 0.5, oneWeek: 1.2, oneMonth: 3.8, sixMonths: 12.1, oneYear: 18.4 },
  { indexName: 'Nifty Auto', sector: 'Automobile', oneDay: 1.1, oneWeek: 2.5, oneMonth: 5.2, sixMonths: 16.8, oneYear: 28.3 },
  { indexName: 'Nifty FMCG', sector: 'FMCG', oneDay: -0.2, oneWeek: 0.4, oneMonth: 1.8, sixMonths: 5.2, oneYear: 8.9 },
  { indexName: 'Nifty Metal', sector: 'Metals', oneDay: 1.8, oneWeek: 3.2, oneMonth: 7.4, sixMonths: 18.6, oneYear: 25.2 },
  { indexName: 'Nifty Energy', sector: 'Energy', oneDay: 0.9, oneWeek: 2.1, oneMonth: 4.8, sixMonths: 11.5, oneYear: 19.7 },
  { indexName: 'Nifty Defence', sector: 'Defence', oneDay: 1.4, oneWeek: 3.8, oneMonth: 9.2, sixMonths: 28.1, oneYear: 45.4 },
  { indexName: 'Nifty Infra', sector: 'Infrastructure', oneDay: 0.6, oneWeek: 1.5, oneMonth: 4.2, sixMonths: 12.6, oneYear: 22.2 },
  { indexName: 'Nifty Realty', sector: 'Real Estate', oneDay: -1.1, oneWeek: -2.9, oneMonth: -5.4, sixMonths: 4.7, oneYear: 9.8 },
]

const ideas = {
  'promoter-buying': [
    { company: 'HAL', ticker: 'HAL', metric: 'Promoter buy Rs 145 Cr', marketCap: 305000 },
    { company: 'Bajaj Finance', ticker: 'BAJFINANCE', metric: 'Promoter stake +0.8%', marketCap: 449000 },
    { company: 'Titan Company', ticker: 'TITAN', metric: 'Promoter increased 0.5%', marketCap: 318000 },
  ],
  'whale-buying': [
    { company: 'ICICI Bank', ticker: 'ICICIBANK', metric: 'Institutional accumulation +2.6%', marketCap: 910000 },
    { company: 'Infosys', ticker: 'INFY', metric: 'HNI block deal Rs 800 Cr', marketCap: 785000 },
    { company: 'L&T', ticker: 'LT', metric: 'FII stake increased 1.2%', marketCap: 498000 },
  ],
  capex: [
    { company: 'Reliance Industries', ticker: 'RELIANCE', metric: 'Capex announced Rs 5,600 Cr', marketCap: 2005000 },
    { company: 'Tata Steel', ticker: 'TATASTEEL', metric: 'Expansion capex Rs 3,200 Cr', marketCap: 202000 },
  ],
  mergers: [
    { company: 'Adani Enterprises', ticker: 'ADANIENT', metric: 'Acquisition in renewable segment', marketCap: 363000 },
    { company: 'HDFC Bank', ticker: 'HDFCBANK', metric: 'Subsidiary consolidation', marketCap: 1400000 },
  ],
  fundamentals: [
    { company: 'TCS', ticker: 'TCS', metric: 'ROCE > 50 and debt free', marketCap: 1542000 },
    { company: 'HCL Tech', ticker: 'HCLTECH', metric: 'Consistent 20%+ ROCE for 5 years', marketCap: 508000 },
    { company: 'Nestle India', ticker: 'NESTLEIND', metric: 'Zero debt with 70%+ ROCE', marketCap: 229000 },
  ],
}

const macroIndicators = [
  { name: 'GDP Growth Rate', category: 'Growth', date: '2026-03-31', value: 7.1, unit: '%' },
  { name: 'CPI Inflation', category: 'Inflation', date: '2026-03-01', value: 4.8, unit: '%' },
  { name: 'WPI Inflation', category: 'Inflation', date: '2026-03-01', value: 2.1, unit: '%' },
  { name: 'RBI Repo Rate', category: 'Monetary', date: '2026-03-15', value: 6.5, unit: '%' },
  { name: 'Forex Reserves', category: 'External', date: '2026-03-20', value: 648.3, unit: 'USD Bn' },
  { name: 'India PMI Manufacturing', category: 'Production', date: '2026-03-01', value: 58.3, unit: 'Index' },
  { name: 'India PMI Services', category: 'Production', date: '2026-03-01', value: 57.2, unit: 'Index' },
  { name: 'IIP Growth', category: 'Production', date: '2026-02-01', value: 5.4, unit: '%' },
  { name: 'FII Net Flow', category: 'Flows', date: '2026-03-31', value: 2.1, unit: 'USD Bn' },
  { name: 'Current Account Deficit', category: 'External', date: '2025-12-31', value: 1.2, unit: '% of GDP' },
]

const rawMaterials = [
  { name: 'Brent Crude', category: 'Energy', date: '2026-04-22', price: 86.4, oneDayChange: 1.2, oneWeekChange: -0.8, oneMonthChange: 2.4 },
  { name: 'Natural Gas', category: 'Energy', date: '2026-04-22', price: 2.9, oneDayChange: -0.6, oneWeekChange: 3.2, oneMonthChange: 8.1 },
  { name: 'Steel HRC', category: 'Metals', date: '2026-04-22', price: 568, oneDayChange: 0.7, oneWeekChange: 1.1, oneMonthChange: 5.4 },
  { name: 'Copper', category: 'Metals', date: '2026-04-22', price: 9150, oneDayChange: 1.1, oneWeekChange: 4.2, oneMonthChange: 9.8 },
  { name: 'Gold', category: 'Metals', date: '2026-04-22', price: 2354, oneDayChange: -0.4, oneWeekChange: 1.7, oneMonthChange: 6.8 },
  { name: 'Cotton', category: 'Agri', date: '2026-04-22', price: 82.3, oneDayChange: 0.2, oneWeekChange: -0.9, oneMonthChange: -2.1 },
  { name: 'Wheat', category: 'Agri', date: '2026-04-22', price: 6.4, oneDayChange: -0.1, oneWeekChange: 0.5, oneMonthChange: 2.2 },
  { name: 'Urea', category: 'Chemicals', date: '2026-04-22', price: 452, oneDayChange: 0.8, oneWeekChange: 1.5, oneMonthChange: 4.4 },
]

const resultsCalendar = companies.map((company, index) => ({
  symbol: company.symbol,
  name: company.name,
  resultDate: dayjs().add((index % 14) + 1, 'day').format('YYYY-MM-DD'),
  period: `Q${(index % 4) + 1}FY26`,
  resultType: 'quarterly',
  hasConcall: index % 2 === 0,
  concallTime: dayjs().add((index % 14) + 1, 'day').hour(16).minute(0).toISOString(),
  estimateRevenue: 21000 + index * 1400,
  actualRevenue: 21400 + index * 1450,
  estimatePat: 3500 + index * 280,
  actualPat: 3560 + index * 300,
  estimateEps: 8.4 + index * 0.7,
  actualEps: 8.6 + index * 0.8,
  sector: company.sector,
  marketCapCategory: company.marketCapCategory,
}))

const allSymbols = companies.map(c => c.symbol)
const newsTypes = ['filing', 'news', 'concall', 'results', 'tweet', 'price-alert']
const newsTitles = [
  'Board approves capex expansion plan',
  'Quarterly results beat street estimates',
  'Management commentary indicates strong demand',
  'Promoter stake increases in latest quarter',
  'FII holding rises for third consecutive quarter',
  'New product launch expected next quarter',
  'Credit rating upgraded by CRISIL',
  'Company announces stock buyback program',
  'Strategic partnership with global player',
  'Revenue guidance raised for FY26',
]

const newsFeed = Array.from({ length: 60 }).map((_, index) => ({
  id: index + 1,
  symbol: allSymbols[index % allSymbols.length],
  title: newsTitles[index % newsTitles.length],
  summary: 'Detailed analysis shows positive momentum in core business segments with improving margins and robust order book.',
  source: ['NSE Filing', 'Business Standard', 'Economic Times', 'Moneycontrol', 'LiveMint'][index % 5],
  url: 'https://example.com/news',
  type: newsTypes[index % newsTypes.length],
  publishedAt: dayjs().subtract(index * 2, 'hour').toISOString(),
}))

const popularScreenerQueries = [
  'ROCE > 20 AND Market Cap > 500 AND Promoter Holding > 50',
  'Net Profit Growth > 15 AND Debt/Equity < 0.5',
  'PE < 25 AND ROE > 15',
  'FII Holding > 25 AND Dividend Yield > 1',
  'Cash from Operations > Net Profit',
  'Free Cash Flow > 5000 AND PE < 30',
]

module.exports = {
  companies,
  stockPrices,
  financials,
  shareholding,
  sectorIndices,
  ideas,
  macroIndicators,
  rawMaterials,
  resultsCalendar,
  newsFeed,
  popularScreenerQueries,
}
