// /lib/auth-helpers.ts
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { headers } from 'next/headers'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateVerificationToken(): string {
  return crypto.randomUUID()
}

export async function logAuditEvent(params: {
  userId?: string
  action: string
  resource: string
  details?: string
  request?: Request
}): Promise<void> {
  const head = headers()
  const ip = head.get('x-forwarded-for') || 'unknown'
  const ua = head.get('user-agent') || 'unknown'

  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      details: params.details,
      ipAddress: ip,
      userAgent: ua,
    }
  })
}

// In-memory rate limiter for simple use cases
const rateLimitMap = new Map<string, { count: number, resetAt: number }>()

export async function checkRateLimit(
  identifier: string, 
  limit: number = 5,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetAt) {
    const newRecord = { count: 1, resetAt: now + windowMs }
    rateLimitMap.set(identifier, newRecord)
    return { allowed: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  record.count += 1
  return { allowed: true, remaining: limit - record.count }
}
