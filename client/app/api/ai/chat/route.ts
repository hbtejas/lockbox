// /app/api/ai/chat/route.ts
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Rate limit: 20 AI messages per user per day
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const messageCount = await prisma.aIMessage.count({
      where: {
        chat: { userId: session.user.id },
        role: 'user',
        createdAt: { gte: today },
      },
    })
    
    if (messageCount >= 20) {
      return new Response('Daily AI limit reached (20/20). Please try again tomorrow.', { status: 429 })
    }

    const { messages, chatId, stockContext } = await req.json()

    // Build system prompt with real stock context
    const systemPrompt = `You are LockAI, an expert Indian stock market 
analyst assistant integrated into Lockbox dashboard. You have deep 
knowledge of NSE, BSE, Indian economy, RBI policies, and financial 
analysis.

Current market context:
${stockContext ? JSON.stringify(stockContext, null, 2) : 'No specific stock selected'}

You can:
- Analyze individual stocks (fundamental + technical)
- Explain market trends and news
- Calculate financial ratios
- Compare stocks
- Explain options strategies
- Discuss macro factors affecting Indian markets
- Suggest portfolio allocation strategies
- Explain financial concepts in simple terms

Always:
- Use ₹ for Indian rupee amounts
- Reference NSE/BSE specifically
- Mention relevant Indian market factors (FII/DII, RBI, SEBI)
- Caveat that this is educational, not financial advice
- Be concise but comprehensive
- Use bullet points for lists
- Format numbers in Indian system (lakhs, crores)

Never:
- Make specific buy/sell recommendations
- Guarantee returns
- Share information about illegal market activities`

    const result = await streamText({
      model: anthropic('claude-3-5-sonnet-20240620') as any,
      system: systemPrompt,
      messages,
      onFinish: async ({ text }) => {
        // Save to database
        if (chatId) {
          await prisma.aIMessage.createMany({
            data: [
              {
                chatId,
                role: 'user',
                content: messages[messages.length - 1].content,
              },
              {
                chatId,
                role: 'assistant',
                content: text,
              },
            ],
          })
        }
      },
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('AI Chat Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
