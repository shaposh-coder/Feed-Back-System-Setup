# Feedback System

Customer store-visit feedback form. Entries save to Supabase on submit. Admin panel comes next.

## Setup

1. Copy `.env.example` → `.env.local` and fill Supabase + admin keys.
2. In Supabase SQL editor, run `database/schema.sql`.
3. Install and run:

```bash
npm install
npm run dev
```

- Customer form: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## Form flow

1. **About you** — name, phone, email, location, gender, age group  
2. **Visit feedback** — date of visit, challenges, purchase categories, satisfaction, notes  
3. **Submit** → `POST /api/feedback` → row in `feedback_entries`

## Admin panel

- Login at `/admin` with any user that exists in **Supabase Auth** (email + password)
- Name/email come from the Auth user (`user_metadata.full_name` / `name` when set)
- List, search, filter, and open feedback entries
- Update status: `new` → `reviewed` → `archived`
- Brand settings (admin-configurable labels) come later

## Reference folders

`Courier-Dashboard/` and `Personal Notedbook/` are local references only (ignored by git).
