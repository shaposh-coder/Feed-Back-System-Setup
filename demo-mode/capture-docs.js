/**
 * Playwright capture for Store Feedback System Demo Mode.
 * Writes PNGs to ../Documentation/images/ and SCREENSHOT-INDEX.md
 *
 * Usage:
 *   DOCS_URL=http://localhost:3001 DOCS_EMAIL=admin@admin.com DOCS_PASSWORD=admin123 npm run screenshots
 */
const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const OUT_DIR = path.resolve(__dirname, '../Documentation/images')
const BASE_URL = (process.env.DOCS_URL || 'http://localhost:3000').replace(/\/$/, '')
const EMAIL = process.env.DOCS_EMAIL || 'admin@admin.com'
const PASSWORD = process.env.DOCS_PASSWORD || 'admin123'

const DESKTOP = { width: 1280, height: 800 }
const MOBILE = { width: 375, height: 812 }

/** @type {{ n: number, file: string, route: string, what: string, notes: string }[]} */
const indexRows = []
let counter = 0

function pad(n) {
  return String(n).padStart(2, '0')
}

async function shot(page, slug, route, what, notes = '') {
  counter += 1
  const file = `${pad(counter)}-${slug}.png`
  const full = path.join(OUT_DIR, file)
  await page.waitForTimeout(400)
  await page.screenshot({ path: full, fullPage: false })
  indexRows.push({ n: counter, file, route, what, notes })
  console.log(`saved ${file}`)
  return file
}

async function waitReady(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ timeout: 20000 })
}

async function openMenu(page) {
  const btn = page.getByRole('button', { name: /open menu|menu/i }).first()
  if (await btn.count()) {
    await btn.click()
    await page.waitForTimeout(350)
  }
}

async function closeMenu(page) {
  const btn = page.getByRole('button', { name: /close menu/i }).first()
  if (await btn.count() && (await btn.isVisible())) {
    await btn.click()
    await page.waitForTimeout(250)
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const name of fs.readdirSync(OUT_DIR)) {
    if (/^\d+-.*\.png$/i.test(name)) fs.unlinkSync(path.join(OUT_DIR, name))
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: DESKTOP,
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  // Public form
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  await waitReady(page, 'feedback')
  await shot(page, 'customer-form', '/', 'Customer feedback form (step 1)', 'desktop')

  // Login (before submit)
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' })
  await waitReady(page, 'Sign in')
  await shot(page, 'login', '/admin/login', 'Admin login with demo account cards', 'desktop')

  // Sign in as admin
  await page.locator('#adminEmail').fill(EMAIL)
  await page.locator('#adminPassword').fill(PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin(?:\/)?$/, { timeout: 20000 })
  await waitReady(page, 'Dashboard')
  await page.waitForTimeout(800)
  await shot(page, 'dashboard', '/admin', 'Admin dashboard with summary cards and charts', 'desktop')

  // Open nav drawer
  await openMenu(page)
  await shot(page, 'nav-drawer', '/admin', 'Admin navigation drawer open', 'desktop')
  await closeMenu(page)

  // Entries
  await page.goto(`${BASE_URL}/admin/entries`, { waitUntil: 'networkidle' })
  await waitReady(page, 'Feedback entries')
  await shot(page, 'entries', '/admin/entries', 'Feedback entries list', 'desktop')

  // Entry detail — click first view/row link
  const viewBtn = page.getByRole('button', { name: /^view$/i }).first()
  const rowLink = page.locator('a[href*="/admin/entries/"]').first()
  if (await viewBtn.count()) {
    await viewBtn.click()
  } else if (await rowLink.count()) {
    await rowLink.click()
  } else {
    // click first card/article
    const card = page.locator('article, tr[data-id], [data-entry-id]').first()
    if (await card.count()) await card.click()
  }
  await page.waitForURL(/\/admin\/entries\/.+/, { timeout: 15000 }).catch(() => {})
  if (/\/admin\/entries\/[^/]+/.test(page.url())) {
    await page.waitForTimeout(500)
    await shot(page, 'entry-detail', page.url().replace(BASE_URL, ''), 'Feedback entry detail', 'desktop')
  } else {
    console.warn('skip entry-detail — could not open an entry')
  }

  // Brand settings
  await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle' })
  await waitReady(page, 'Brand')
  await shot(page, 'brand-settings', '/admin/settings', 'Brand settings', 'desktop')

  // Profile
  await page.goto(`${BASE_URL}/admin/profile`, { waitUntil: 'networkidle' })
  await waitReady(page, 'Profile')
  await shot(page, 'profile', '/admin/profile', 'Admin profile', 'desktop')

  // Mobile subset
  await page.setViewportSize(MOBILE)

  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' })
  // may already be logged in
  if (page.url().includes('/admin/login')) {
    await shot(page, 'mobile-login', '/admin/login', 'Login (mobile)', 'mobile 375×812')
    await page.locator('#adminEmail').fill(EMAIL)
    await page.locator('#adminPassword').fill(PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/admin/, { timeout: 20000 })
  }

  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' })
  await waitReady(page, 'Dashboard')
  await page.waitForTimeout(600)
  await shot(page, 'mobile-dashboard', '/admin', 'Dashboard (mobile)', 'mobile 375×812')

  await openMenu(page)
  await shot(page, 'mobile-nav', '/admin', 'Navigation drawer (mobile)', 'mobile 375×812')
  await closeMenu(page)

  await page.goto(`${BASE_URL}/admin/entries`, { waitUntil: 'networkidle' })
  await waitReady(page, 'Feedback entries')
  await shot(page, 'mobile-entries', '/admin/entries', 'Entries list (mobile)', 'mobile 375×812')

  await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle' })
  await waitReady(page, 'Brand')
  await shot(page, 'mobile-settings', '/admin/settings', 'Brand settings (mobile)', 'mobile 375×812')

  await browser.close()

  const when = new Date().toISOString()
  const md = [
    '# Screenshot index',
    '',
    `- Captured: ${when}`,
    `- Base URL: ${BASE_URL}`,
    `- User: ${EMAIL}`,
    `- Count: ${indexRows.length} PNG files`,
    '',
    '| # | file | route | what | notes |',
    '|---|------|-------|------|-------|',
    ...indexRows.map(
      (r) => `| ${r.n} | ${r.file} | ${r.route} | ${r.what} | ${r.notes} |`
    ),
    '',
  ].join('\n')

  fs.writeFileSync(path.join(OUT_DIR, 'SCREENSHOT-INDEX.md'), md)
  console.log(`\nDone: ${indexRows.length} screenshots → ${OUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
