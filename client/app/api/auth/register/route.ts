// /app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, checkRateLimit, logAuditEvent } from '@/lib/auth-helpers'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
})

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = await checkRateLimit(`register_${ip}`, 3, 3600000) // 3 per hour

    if (!allowed) {
      return NextResponse.json({ error: 'Too many registration attempts. Try again in an hour.' }, { status: 429 })
    }

    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        isActive: true,
      },
      select: { id: true, email: true, name: true }
    })

    await logAuditEvent({
      userId: user.id,
      action: 'USER_REGISTERED',
      resource: 'auth',
      details: `User registered with email ${email}`,
      request: req
    })

    return NextResponse.json({ message: 'User registered successfully', user }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
