# Ruthys Collection

A boutique commerce storefront for Ruthys Collection, built to showcase premium perfumes, jewellery, accessories, waist beads, scarves and bags from Kano, Nigeria.

This project is a custom-owned storefront and admin workflow for a real retail brand. It combines a luxury storefront, product catalog, WhatsApp ordering flow and a private owner dashboard for managing the collection.

## Tech stack

- Vite + React + TypeScript
- TanStack Router and TanStack Start
- Supabase for auth, storage and database
- AI-powered product assistant and catalog tools
- Tailwind CSS with shadcn/ui styling

## Business profile

- Brand: Ruthys Collection
- Founder: Ruth Friday
- Location: Kano, Nigeria
- Delivery: Nationwide shipping with home delivery fees and free delivery over threshold
- Ordering: WhatsApp-first flow with direct customer messaging
- Payment: Customer-facing storefront with real checkout and admin workflows

## Local setup

Requirements: Node.js 22 and npm.

```sh
git clone https://github.com/Uibra/ruthy-s-collection.git
cd ruthy-s-collection
npm install
npm run dev -- --host 0.0.0.0
```

## Environment setup

Create a local environment file with your project secrets before running the app.

```sh
cp .env.example .env.local
```

Add the needed values for:

- Supabase URL and anon/service keys
- AI gateway configuration for the storefront assistant
- Any deployment-specific environment values required by the app

## Admin onboarding

1. Create the first owner account from the app at `/auth`.
2. Sign in and open `/admin`.
3. Add or refine the catalogue in the admin screen.
4. Keep shop settings aligned with the business profile in the storefront.

## Product seeding

If you want to load an initial real catalogue quickly:

```sh
npm run seed:products
```

The seed script uses the service role key to insert the collection into Supabase and upserts by `slug`, so rerunning it safely refreshes the same catalogue.

## Production notes

- Keep the storefront data in sync with the live business profile
- Do not reopen public sign-up beyond the first owner setup
- Keep all private credentials in local `.env` files and never commit them
- Treat this repo as the working codebase for the real boutique brand
