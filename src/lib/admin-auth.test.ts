import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveAdminAccess } from './admin-auth.ts';

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
