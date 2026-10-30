<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Sign-up is permanently locked after the first (owner) account exists: a `before insert` trigger on `auth.users` (`enforce_single_owner_signup`) raises when any user already exists, and `/auth` hides the create-account option via the `signup_open()` RPC. Never re-enable open sign-up.
- Admin access only through `has_role('admin')` RPC (`public.user_roles`); the first signed-in account claimed the admin role (`claim_first_admin`).
- The `product-images` storage bucket is private (public buckets are blocked in this workspace); uploads return 10-year signed URLs.
- Store prices in whole Naira integers (₦ is the shop currency; delivery: home ₦2,000, pickup free, free over ₦75,000).
- AI calls use `openai/gpt-6-astra` on the Responses API via `src/lib/ai-gateway.server.ts`; never send `max_tokens`/`temperature` (the model rejects them).
