import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveAdminAccess } from './admin-auth.ts';
import { ensureAdminAccess } from './catalog.functions.ts';

test('redirects unauthenticated users to the login page', () => {
  const result = resolveAdminAccess({ isAuthenticated: false, isAdmin: undefined });
  assert.equal(result.shouldRedirect, true);
  assert.equal(result.reason, 'auth');
});

test('keeps signed in non-admin users on the access-denied screen', () => {
  const result = resolveAdminAccess({ isAuthenticated: true, isAdmin: false });
  assert.equal(result.shouldRedirect, false);
  assert.equal(result.reason, 'forbidden');
});

test('allows admin users through', () => {
  const result = resolveAdminAccess({ isAuthenticated: true, isAdmin: true });
  assert.equal(result.shouldRedirect, false);
  assert.equal(result.reason, 'allowed');
});

test('self-claims owner admin access when the role row is missing', async () => {
  const calls: string[] = [];
  const supabase = {
    rpc: async (fn: string, args?: Record<string, unknown>) => {
      calls.push(fn);
      if (fn === 'has_role') return { data: false };
      if (fn === 'claim_first_admin') return { data: true };
      return { data: null };
    },
  } as any;

  const ok = await ensureAdminAccess(supabase, 'user-123');
  assert.equal(ok, true);
  assert.deepEqual(calls, ['has_role', 'claim_first_admin']);
});
