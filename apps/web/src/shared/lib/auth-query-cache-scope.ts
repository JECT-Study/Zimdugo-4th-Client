export const AUTH_QUERY_CACHE_ANONYMOUS = "anonymous" as const;

export type AuthQueryCacheScope =
  | typeof AUTH_QUERY_CACHE_ANONYMOUS
  | number
  | null;

export function getAuthQueryCacheScope(
  isAuthenticated: boolean,
  userId: number | null | undefined,
): AuthQueryCacheScope {
  if (!isAuthenticated) {
    return AUTH_QUERY_CACHE_ANONYMOUS;
  }

  return userId ?? null;
}
