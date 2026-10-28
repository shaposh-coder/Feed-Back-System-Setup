import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Vercel Cron endpoint — scheduled via root vercel.json.
 * Protect with CRON_SECRET; Vercel sends Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
  })
}
