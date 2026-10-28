# Changelog

All notable changes to Store Feedback System are documented here.

## [1.0.0] — 2026-10-28

### Added
- Vercel Cron endpoint at `/api/cron` (daily 10:00 UTC) protected by `CRON_SECRET`.
- Initial Demo Mode and documentation pipeline for portfolio publishing.
- Customer store-visit feedback form with multi-step flow.
- Admin dashboard with response charts (satisfaction, gender, age, challenges, categories).
- Feedback entries list, detail view, brand settings, and profile management.
- Portfolio documentation guides with screenshots under `Documentation/images/`.

### Changed
- Updated root README with product overview and documentation screenshots.

### Fixed
- Stopped ignoring `demo-mode/` in root `.vercelignore` so the Demo Mode Vercel project can build with Root Directory set to `demo-mode`.
