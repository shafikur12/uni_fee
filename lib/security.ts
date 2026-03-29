import { NextRequest, NextResponse } from 'next/server'

// Rate limiting configuration
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_REQUESTS = 100
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimit.get(ip)

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count < RATE_LIMIT_REQUESTS) {
    record.count++
    return true
  }

  return false
}

export function getRateLimitHeaders(remaining: number, resetTime: number) {
  return {
    'X-RateLimit-Limit': RATE_LIMIT_REQUESTS.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
  }
}

export async function withRateLimit(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }

  return handler(request)
}

export function validateRequest(data: any, requiredFields: string[]): { valid: boolean; error?: string } {
  for (const field of requiredFields) {
    if (!data[field]) {
      return { valid: false, error: `Missing required field: ${field}` }
    }
  }
  return { valid: true }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}
