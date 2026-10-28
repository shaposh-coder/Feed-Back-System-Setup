/** Fixed Demo Mode accounts. Credentials are shown on the Demo Mode login screen only. */

export type DemoRole = 'admin' | 'editor' | 'viewer'

export type DemoUser = {
  id: string
  email: string
  /** Optional short login alias (e.g. "admin") accepted alongside the email. */
  alias: string
  password: string
  name: string
  role: DemoRole
  roleLabel: string
  description: string
}

export const DEMO_USERS: readonly DemoUser[] = [
  {
    id: 'admin',
    email: 'admin@admin.com',
    alias: 'admin',
    password: 'admin123',
    name: 'Amelia Whitfield',
    role: 'admin',
    roleLabel: 'Administrator',
    description: 'Full access: entries, brand settings, and profile.',
  },
  {
    id: 'editor',
    email: 'editor@demo.com',
    alias: 'demo',
    password: 'demo123',
    name: 'Daniel Brooks',
    role: 'editor',
    roleLabel: 'Store Manager',
    description: 'Review entries, update statuses, and manage brand settings.',
  },
  {
    id: 'viewer',
    email: 'viewer@demo.com',
    alias: 'viewer',
    password: 'view123',
    name: 'Priya Nair',
    role: 'viewer',
    roleLabel: 'Viewer',
    description: 'Read-only access to the dashboard and feedback entries.',
  },
]

export function findDemoUserById(id: string): DemoUser | undefined {
  return DEMO_USERS.find((user) => user.id === id)
}

export function findDemoUserByLogin(login: string): DemoUser | undefined {
  const key = login.trim().toLowerCase()
  if (!key) return undefined
  return DEMO_USERS.find((user) => user.email.toLowerCase() === key || user.alias === key)
}

export function canEdit(role: DemoRole | undefined): boolean {
  return role === 'admin' || role === 'editor'
}
