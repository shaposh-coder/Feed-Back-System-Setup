# Changelog

All notable changes to Store Feedback System are documented here.

## [1.0.0] — 2026-10-28

### Added
- Public `GET /api/locations` catalog for the customer form; SQL patch `database/patch-feedback-branch.sql`.
- Brand Settings sidebar submenu with Locations & Branches page (locations table + shops table with location dropdown; `store_locations` / `store_branches`, patch `database/patch-locations-branches.sql`).
- Postgres admin RPCs (`database/rpc.sql`) for dashboard stats, paged entries, entry open, and brand asset updates — Courier-style, service-role only.
- Vercel Cron endpoint at `/api/cron` (daily 10:00 UTC) protected by `CRON_SECRET`.
- Initial Demo Mode and documentation pipeline for portfolio publishing.
- Customer store-visit feedback form with multi-step flow.
- Admin dashboard with response charts (satisfaction, gender, age, challenges, categories).
- Feedback entries list, detail view, brand settings, and profile management.
- Portfolio documentation guides with screenshots under `Documentation/images/`.

### Changed
- Removed “Refund policy” from visit challenge options on the customer form.
- Customer form footer shows “© {year} {brand}. All rights reserved.” under the visit note.
- Customer form brand logo/name links to `/` so thank-you screen returns to a fresh form.
- Customer form free-text question label set to “Do you have any feedback or suggestion?”
- Customer feedback form Location and Branch are searchable dropdowns (type to filter); Branch options follow the selected location (stores `branch` on submissions).
- Customer feedback form: Email is optional (blank allowed; invalid format still rejected).
- Locations & Branches tables use Courier settings layout: mobile card lists, desktop side-by-side tables (profile-style grid), FormModal add/edit and delete confirm (production + Demo Mode).
- Admin dashboard, entries list, and entry open now use RPCs instead of full-table or multi-round-trip Supabase reads.
- Brand settings reads are short-cached; favicon no longer re-fetches `/api/brand` on every page load.
- Brand image upload skips bucket list/update on the hot path.
- Updated root README with product overview and documentation screenshots.

### Fixed
- Stopped ignoring `demo-mode/` in root `.vercelignore` so the Demo Mode Vercel project can build with Root Directory set to `demo-mode`.
- Dashboard stats no longer hit Supabase’s 1000-row silent cap when aggregating in Node.
