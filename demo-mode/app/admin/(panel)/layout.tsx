import AdminGuard from '@/components/admin/AdminGuard'

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>
}
