# AI shopping assistant + admin product manager

## What you get
1. **"Help me find it" assistant** — a box on the home and shop pages where shoppers type things like "a sweet gift for my sister under 30k". The AI picks matching products from your catalogue and shows them as clickable product cards with a short reason for each.
2. **Admin area (/admin)** — a private sign-in for you only. From there you can:
   - Add, edit and delete products
   - Upload/replace/reorder product photos
   - Change price, sale (compare) price, stock, category, description, details, options (sizes/colours)
   - Toggle Featured / Best seller / New arrival
   - Changes show on the store instantly

## How it works
- Turn on Lovable Cloud to store products, photos and admin login.
- Move the current sample catalogue into the database (seeded once) so nothing is lost.
- Store pages read products from the database instead of the fixed list.
- Only accounts with the admin role can edit; shoppers can only view.

## Technical details
- Tables: `products` (all current fields, images as text[]), `user_roles` + `has_role()`; public SELECT on products, admin-only write via RLS. Storage bucket `product-images` (public read, admin write).
- Seed migration with literal INSERTs of the existing products.
- Routes: `/auth` (email login), `/_authenticated/admin` gate + role check, `/admin/products/$id` editor.
- AI: server function using `openai/gpt-6-astra` via Responses API (streamed, structured output of product ids + reasons), catalogue summary passed in prompt; results validated against real ids. Errors (429/402) shown to shopper.
- First admin: you sign up, then I grant your account the admin role.
