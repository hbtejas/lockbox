// /app/api/user/watchlist/[symbol]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { symbol: string } }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!session.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.watchlist.delete({
    where: {
      userId_symbol: {
        userId: session.user.id,
        symbol: params.symbol
      }
    }
  })

  return NextResponse.json({ message: 'Removed' })
}
