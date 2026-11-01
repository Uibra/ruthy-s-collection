export function resolveAdminAccess({
  isAuthenticated,
  isAdmin,
}: {
  isAuthenticated: boolean | null | undefined;
  isAdmin: boolean | null | undefined;
}) {
  if (!isAuthenticated) return { shouldRedirect: true, reason: "auth" };
  if (isAdmin === false) return { shouldRedirect: false, reason: "forbidden" };
  return { shouldRedirect: false, reason: "allowed" };
}
