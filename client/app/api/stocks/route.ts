import { NextResponse } from 'next/server';

const SYMBOLS = [
  // NIFTY 50
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'HINDUNILVR.NS',
  'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'KOTAKBANK.NS', 'LT.NS', 'AXISBANK.NS',
  'ASIANPAINT.NS', 'MARUTI.NS', 'SUNPHARMA.NS', 'TITAN.NS', 'BAJFINANCE.NS',
  'WIPRO.NS', 'ULTRACEMCO.NS', 'ONGC.NS', 'POWERGRID.NS', 'NTPC.NS', 'TECHM.NS',
  'NESTLEIND.NS', 'HCLTECH.NS', 'BAJAJFINSV.NS', 'TATAMOTORS.NS', 'DIVISLAB.NS',
  'JSWSTEEL.NS', 'TATACONSUM.NS', 'HINDALCO.NS', 'ADANIENT.NS', 'COALINDIA.NS',
  'DRREDDY.NS', 'CIPLA.NS', 'BPCL.NS', 'EICHERMOT.NS', 'GRASIM.NS', 'HEROMOTOCO.NS',
  'INDUSINDBK.NS', 'BRITANNIA.NS', 'APOLLOHOSP.NS', 'BAJAJ-AUTO.NS', 'M&M.NS',
  'SBILIFE.NS', 'HDFCLIFE.NS', 'UPL.NS', 'VEDL.NS', 'TATASTEEL.NS', 'ADANIPORTS.NS',
  
  // NEXT 50 & ACTIVE MIDCAPS
  'ZOMATO.NS', 'PAYTM.NS', 'NYKAA.NS', 'AWL.NS', 'DELHIVERY.NS', 'JIOFIN.NS',
  'IRFC.NS', 'RVNL.NS', 'CONCOR.NS', 'MAZDOCK.NS', 'HAL.NS', 'BEL.NS',
  'BHEL.NS', 'GAIL.NS', 'IOC.NS', 'SAIL.NS', 'PFC.NS', 'RECLTD.NS',
  'YESBANK.NS', 'IDFCFIRSTB.NS', 'PNB.NS', 'BANKBARODA.NS', 'CANBK.NS', 'UNIONBANK.NS',
  'DLF.NS', 'GODREJCP.NS', 'DABUR.NS', 'MARICO.NS', 'PIDILITIND.NS', 'SRF.NS',
  'TRENT.NS', 'VBL.NS', 'PAGEIND.NS', 'MUTHOOTFIN.NS', 'CHOLAFIN.NS', 'ABCAPITAL.NS',
  'AUROPHARMA.NS', 'LUPIN.NS', 'BIOCON.NS', 'PEL.NS', 'GLENMARK.NS', 'LAURUSLABS.NS',
  'TATAPOWER.NS', 'ADANIPOWER.NS', 'JSWENERGY.NS', 'NHPC.NS', 'SJVN.NS',
  'HDFCAMC.NS', 'LTIM.NS', 'MPHASIS.NS', 'PERSISTENT.NS', 'COFORGE.NS', 'KPITTECH.NS',
  'POLYCAB.NS', 'KEI.NS', 'DIXON.NS', 'AMBER.NS', 'HAVELLS.NS', 'VOLTAS.NS',
  'ASHOKLEY.NS', 'TVSMOTOR.NS', 'BALKRISIND.NS', 'MRF.NS', 'APOLLOTYRE.NS',
  'JKCEMENT.NS', 'ACC.NS', 'AMBUJACEM.NS', 'SHREECEM.NS', 'DALBHARAT.NS'
];

export async function GET() {
  try {
    // Split symbols into chunks of 15 to avoid rate limiting or long response times
    const chunks = [];
    for (let i = 0; i < SYMBOLS.length; i += 15) {
      chunks.push(SYMBOLS.slice(i, i + 15));
    }

    const results = [];
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (symbol) => {
          try {
            const response = await fetch(
              `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
              { 
                next: { revalidate: 60 },
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
              }
            );
            const data = await response.json();
            const result = data?.chart?.result?.[0];
            if (!result) return null;

            const meta = result.meta;
            const quote = result.indicators?.quote?.[0];
            if (!meta || !quote) return null;

            const high = quote.high || [];
            const low = quote.low || [];
            const filteredHigh = high.filter((h: any) => h != null);
            const filteredLow = low.filter((l: any) => l != null);

            return {
              symbol: symbol,
              shortName: symbol.split('.')[0],
              regularMarketPrice: meta.regularMarketPrice || 0,
              regularMarketChange: (meta.regularMarketPrice || 0) - (meta.chartPreviousClose || 0),
              regularMarketChangePercent: meta.chartPreviousClose ? (((meta.regularMarketPrice || 0) - meta.chartPreviousClose) / meta.chartPreviousClose) * 100 : 0,
              regularMarketVolume: meta.regularMarketVolume || 0,
              regularMarketDayHigh: filteredHigh.length > 0 ? Math.max(...filteredHigh) : (meta.regularMarketPrice || 0),
              regularMarketDayLow: filteredLow.length > 0 ? Math.min(...filteredLow) : (meta.regularMarketPrice || 0),
              marketCap: meta.marketCap || 0,
              regularMarketPreviousClose: meta.chartPreviousClose || 0,
              fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
              fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
            };
          } catch (e) {
            return null;
          }
        })
      );
      results.push(...chunkResults);
    }

    const stocks = results.filter(s => s !== null);

    return NextResponse.json(stocks, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch stocks', details: error.message }, { status: 500 });
  }
}
