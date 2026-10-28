import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getAdminSessionFromCookies } from '@/lib/adminSession'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const maxDuration = 60

const BUCKET_NAME = 'branding-assets'
const MAX_FILE_BYTES = 2 * 1024 * 1024

const LOGO_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/avif',
  'image/svg+xml',
])
const FAVICON_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/avif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/svg+xml',
])

function sanitizeFilePart(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-')
}

async function ensureBucket(admin: ReturnType<typeof getSupabaseAdmin>) {
  const allowedMimeTypes = Array.from(new Set([...LOGO_TYPES, ...FAVICON_TYPES]))
  const create = await admin.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: MAX_FILE_BYTES,
    allowedMimeTypes,
  })
  if (create.error && !/already exists/i.test(create.error.message)) {
    throw new Error(create.error.message)
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  const kindRaw = String(form?.get('kind') ?? 'logo').trim().toLowerCase()
  const kind = kindRaw === 'favicon' ? 'favicon' : 'logo'
  const allowed = kind === 'favicon' ? FAVICON_TYPES : LOGO_TYPES

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required.' }, { status: 400 })
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase()
  const typeOk =
    allowed.has(file.type) ||
    (ext === 'avif' && (file.type === '' || file.type === 'application/octet-stream')) ||
    (ext === 'ico' && (file.type === '' || file.type === 'application/octet-stream'))

  if (!typeOk) {
    return NextResponse.json(
      {
        error:
          kind === 'favicon'
            ? 'Favicon must be PNG, JPG, WEBP, AVIF, SVG, or ICO.'
            : 'Logo must be PNG, JPG, WEBP, AVIF, or SVG.',
      },
      { status: 400 }
    )
  }
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'Image max size is 2MB.' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()
    const safeExt = sanitizeFilePart(ext || 'png') || 'png'
    const folder = kind === 'favicon' ? 'favicon' : 'logo'
    const filePath = `${folder}/${Date.now()}-${sanitizeFilePart(session.userId)}.${safeExt}`
    const bytes = await file.arrayBuffer()
    const contentType =
      file.type && file.type !== 'application/octet-stream'
        ? file.type
        : ext === 'avif'
          ? 'image/avif'
          : ext === 'ico'
            ? 'image/x-icon'
            : file.type || 'application/octet-stream'

    let upload = await admin.storage.from(BUCKET_NAME).upload(filePath, bytes, {
      upsert: false,
      contentType,
      cacheControl: '3600',
    })

    // Create bucket only when missing — avoid listBuckets + updateBucket on every upload
    if (upload.error && /bucket|not found|does not exist/i.test(upload.error.message)) {
      try {
        await ensureBucket(admin)
      } catch (err) {
        console.error('create bucket:', err)
        return NextResponse.json(
          {
            error:
              'Unable to create storage for brand images. Create a public bucket named branding-assets in your project storage, then try again.',
          },
          { status: 500 }
        )
      }
      upload = await admin.storage.from(BUCKET_NAME).upload(filePath, bytes, {
        upsert: false,
        contentType,
        cacheControl: '3600',
      })
    }

    if (upload.error) {
      console.error('upload:', upload.error.message)
      const mimeBlocked = /mime type|not supported/i.test(upload.error.message)
      return NextResponse.json(
        {
          error: mimeBlocked
            ? 'This image format is blocked in storage settings. In Storage → branding-assets → Configuration, allow image/avif (or clear Allowed MIME types), then try again.'
            : 'Unable to upload image. Please try again.',
        },
        { status: 500 }
      )
    }

    const publicUrl = admin.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl
    if (!publicUrl) {
      return NextResponse.json({ error: 'Unable to create image link.' }, { status: 500 })
    }

    const { data, error } = await admin.rpc('rpc_admin_set_brand_asset', {
      p_kind: kind,
      p_url: publicUrl,
    })

    if (error) {
      console.error('brand asset save rpc:', error.message)
      return NextResponse.json({ error: 'Image uploaded but settings could not be saved.' }, { status: 500 })
    }

    const row = data as {
      brand_name?: string
      logo_url?: string
      favicon_url?: string
      updated_at?: string
    } | null

    revalidateTag('brand')

    return NextResponse.json({
      kind,
      url: publicUrl,
      brandName: row?.brand_name ?? '',
      logoUrl: row?.logo_url ?? '',
      faviconUrl: row?.favicon_url ?? '',
      updatedAt: row?.updated_at ?? null,
    })
  } catch (err) {
    console.error('brand upload route:', err)
    return NextResponse.json({ error: 'Unable to upload image right now.' }, { status: 500 })
  }
}
