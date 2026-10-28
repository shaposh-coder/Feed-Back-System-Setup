export type StoreBranch = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
}

export type StoreLocation = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
  branches: StoreBranch[]
}

type RpcBranch = {
  id?: string
  name?: string
  sortOrder?: number
  isActive?: boolean
}

type RpcLocation = {
  id?: string
  name?: string
  sortOrder?: number
  isActive?: boolean
  branches?: RpcBranch[]
}

export function shapeLocationsCatalog(payload: unknown): StoreLocation[] {
  const rows = Array.isArray(payload) ? (payload as RpcLocation[]) : []
  return rows
    .map((loc) => ({
      id: String(loc.id ?? ''),
      name: String(loc.name ?? '').trim(),
      sortOrder: Number(loc.sortOrder ?? 0),
      isActive: loc.isActive !== false,
      branches: (loc.branches ?? [])
        .map((br) => ({
          id: String(br.id ?? ''),
          name: String(br.name ?? '').trim(),
          sortOrder: Number(br.sortOrder ?? 0),
          isActive: br.isActive !== false,
        }))
        .filter((br) => br.id && br.name),
    }))
    .filter((loc) => loc.id && loc.name)
}
