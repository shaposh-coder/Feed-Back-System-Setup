# Feedback System

Customer store-visit feedback form. Entries save to Supabase on submit. Admin panel comes next.

## Setup

1. Copy `.env.example` → `.env.local` and fill Supabase keys.
2. In Supabase SQL editor, run `database/schema.sql`.
3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Form flow

1. **About you** — name, phone, email, location, gender, age group  
2. **Visit feedback** — date of visit, challenges, purchase categories, satisfaction, notes  
3. **Submit** → `POST /api/feedback` → row in `feedback_entries`

## Reference folders

`Courier-Dashboard/` and `Personal Notedbook/` are local references only (ignored by git).
