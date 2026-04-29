// /app/api/ai/analyze/route.ts
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { auth } from '@/auth'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return new Response('Unauthorized', { status: 401 })

    const { symbol, stockData } = await req.json()

    const prompt = `Analyze ${symbol} stock based on this data:
   Current Price: ₹${stockData.regularMarketPrice}
   Change Today: ${stockData.regularMarketChangePercent}%
   52W High: ₹${stockData.fiftyTwoWeekHigh} | 52W Low: ₹${stockData.fiftyTwoWeekLow}
   P/E Ratio: ${stockData.trailingPE || 'N/A'}
   Volume: ${stockData.regularMarketVolume}
   Market Cap: ${stockData.marketCap}
   
   Provide:
   1. Technical Analysis (3-4 bullet points)
   2. Key Support & Resistance levels
   3. Short-term outlook (1-4 weeks)
   4. Key risks to watch
   5. Overall sentiment: Bullish/Bearish/Neutral
   
   Keep each section to 2-3 lines. Be specific with price levels. 
   Use Indian numbering system (Lakh/Crore) if applicable.`

    const result = await streamText({
      model: anthropic('claude-3-5-sonnet-20240620') as any,
      messages: [{ role: 'user', content: prompt }],
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
