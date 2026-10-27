import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies } from '@/lib/adminSession'

export async function GET() {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  })
}
