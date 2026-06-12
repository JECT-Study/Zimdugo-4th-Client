import { useQuery } from "@tanstack/react-query";
import { getMeProfile, type MeProfileData } from "#/shared/api/me";
import {
  getAuthQueryCacheScope,
  type AuthQueryCacheScope,
} from "#/shared/lib/auth-query-cache-scope";
import { useAuthStore } from "#/shared/store/authStore";

export type { MeProfileData };

export const userProfileQueryKeyPrefix = ["me", "profile"] as const;

export const userProfileQueryKey = (scope: AuthQueryCacheScope) =>
  [...userProfileQueryKeyPrefix, scope] as const;

export function useUser(enabled = true) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);
  const scope = getAuthQueryCacheScope(isAuthenticated, userId);

  return useQuery({
    queryKey: userProfileQueryKey(scope),
    queryFn: ({ signal }) => getMeProfile(signal),
    enabled,
  });
}
