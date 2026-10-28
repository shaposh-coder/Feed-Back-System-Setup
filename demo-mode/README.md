# Store Feedback System — Demo Mode

Standalone, offline demo of the Store Feedback System. It mirrors the production screens (customer form, admin login, dashboard, entries, brand settings, profile) but uses **no Supabase, no API routes and no `.env` file**. All data lives in the browser's `localStorage`.

> Demo Mode is a **separate app**. It is excluded from the main product build and must be deployed as its own project.

## Run locally

```bash
cd demo-mode
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If the production app is already using port 3000, run `npx next dev -p 3001`.

Other commands:

| Command | Purpose |
|---------|---------|
| `npm run build` | Production build of the demo |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run screenshots` | Placeholder — implemented in Phase 3 of the portfolio pipeline |

## Screens

| Route | Screen |
|-------|--------|
| `/` | Public multi-step customer feedback form |
| `/admin/login` | Demo login with clickable account cards |
| `/admin` | Dashboard (gender, age group, challenges, categories, satisfaction charts) |
| `/admin/entries` | Feedback entries list with search, status filter, pagination |
| `/admin/entries/[id]` | Entry detail and status updates |
| `/admin/settings` | Brand Settings (brand name, optional logo and favicon) |
| `/admin/profile` | My Profile (display name, password form) |

## Demo accounts (maintainers)

Accounts are also shown as clickable cards on the Demo Mode login page. Credentials are intentionally **not** stored in `demo.json`.

| Role | Email (or alias) | Password | Access |
|------|------------------|----------|--------|
| Administrator | `admin@admin.com` (or `admin`) | `admin123` | Full access |
| Store Manager | `editor@demo.com` (or `demo`) | `demo123` | Update statuses, edit brand settings |
| Viewer | `viewer@demo.com` (or `viewer`) | `view123` | Read-only dashboard and entries |

## How the demo works

| Production | Demo Mode replacement |
|------------|-----------------------|
| Supabase Auth + signed `feedback_admin_session` cookie + middleware | `lib/demoAuth.ts` — session in `localStorage`, client-side guard in `AdminGuard` |
| `feedback_entries`, `brand_settings` tables + `/api/*` routes | `lib/demoStore.ts` — CRUD on `localStorage` |
| Real customer data | `lib/demoSeed.ts` — fictional seed data (invented names, `example.com` emails) |
| Admin user from Supabase Auth | `lib/demoUsers.ts` — three fixed accounts |
| Brand logo/favicon upload to storage | Image stored as a data URL (max 512 KB) |
| Password change via Supabase Auth | Validated but not applied, so demo logins keep working |

### Storage keys

```text
demo:feedback-system:session
demo:feedback-system:user:{userId}:entries
demo:feedback-system:user:{userId}:brand
demo:feedback-system:user:{userId}:profile
demo:feedback-system:user:{userId}:seeded
```

- Each account has its own **sandbox**. Changes made by one account are never visible to another.
- A sandbox is seeded on the account's **first sign-in**. **Reset demo data** (admin drawer, bottom left) restores the original seed for the signed-in account only.
- The public customer form has no signed-in user, so submissions are appended to the **Administrator** sandbox (`PUBLIC_SANDBOX_USER_ID` in `lib/demoStore.ts`). Submit feedback, then sign in as `admin@admin.com` to see the charts and entries update. The public form and login page also display the Administrator's brand settings.

## Branding

- Favicon: `public/favicon.png`, downloaded from `https://www.trendswd.com/favicon.png` and wired in `app/layout.tsx` and as the default brand favicon in the seed data.
- No wide logo is used: the app has no dedicated navbar/footer logo slot (the optional customer logo is configured in Brand Settings).
- Palette and typography are copied from the production `tailwind.config.ts` and `app/globals.css`.

## `demo.json`

```json
{
  "live_demo_url": "",
  "type": "web-app"
}
```

**TODO (maintainer):** deploy this folder as its own Vercel project (Root Directory = `demo-mode`), then set `live_demo_url` to the public URL. Do not add credentials to this file.

## Excluded from the main product build

Demo Mode has its own `package.json`, `tsconfig.json` and `.eslintrc.json` (`"root": true`). At the repository root it is excluded via:

- `tsconfig.json` → `exclude: ["demo-mode", ...]`
- `.eslintrc.json` → `ignorePatterns: ["demo-mode/**", ...]`
- `.vercelignore` → `demo-mode`
- `.gitignore` → safety-net entries for `demo-mode/node_modules/`, `demo-mode/.next/`, `demo-mode/.env*`

The root app never imports from `demo-mode/`. Deploy the demo separately; never fold it into the main product project.

## Git

`demo-mode/.gitignore` mirrors the root ignores (dependencies, build output, `.env*`, `.vercel`, OS/debug files, Playwright output). Commit `demo.json`, source, `public/` and `.gitignore`.
