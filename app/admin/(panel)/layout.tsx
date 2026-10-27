import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import { getAdminSessionFromCookies } from '@/lib/adminSession'

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <AdminShell name={session.name} email={session.email}>
      {children}
    </AdminShell>
  )
}
