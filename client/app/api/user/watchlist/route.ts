// /app/api/user/watchlist/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!session.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const watchlist = await prisma.watchlist.findMany({
    where: { userId: session.user.id },
    select: { symbol: true }
  })

  return NextResponse.json(watchlist.map(w => w.symbol))
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { symbol } = await req.json()
  if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 })

  if (!session.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const item = await prisma.watchlist.upsert({
    where: {
      userId_symbol: {
        userId: session.user.id,
        symbol
      }
    },
    update: {},
    create: {
      userId: session.user.id,
      symbol
    }
  })

  return NextResponse.json(item)
}
