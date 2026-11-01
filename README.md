# Ruthys Collection

Custom storefront and commerce app for Ruthys Collection.

This project was originally generated from a Lovable starter, but it is now being adapted as a custom-owned codebase for the business.

## Tech stack

- Vite + React + TypeScript
- TanStack Router / Start
- Supabase for auth and database
- AI gateway integration for storefront features
- Tailwind CSS and shadcn/ui styling

## Development

You need Node.js 22 and npm.

```sh
git clone <your-github-repo-url>
cd pixel-perfect-match
npm install
npm run dev -- --host 0.0.0.0
```

## Environment

Set up your local environment variables required by Supabase and AI features before running the app.

## Owner setup and first real products

1. Create the first owner account from the app at `/auth`.
2. Sign in and open `/admin`.
3. Add the real products you want to sell from the admin product screen.
4. If you want to seed the first catalogue immediately, run:

```sh
cp .env.example .env.local
# add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local
npm run seed:products
```

The seed script uses the service role key to insert live product rows into Supabase and upserts by `slug`, so rerunning it safely refreshes the same catalogue.

## Notes

This repository is your custom project. Keep your own branding, database, and deployment configuration aligned with your business rather than the Lovable-generated template.
# ruthy-s-collection
