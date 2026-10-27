import { cookies } from 'next/headers'
import { ADMIN_COOKIE, verifyAdminToken, type AdminSession } from '@/lib/adminAuth'

export async function getAdminSessionFromCookies(): Promise<AdminSession | null> {
  const token = cookies().get(ADMIN_COOKIE)?.value
  if (!token) return null
  return verifyAdminToken(token)
}
