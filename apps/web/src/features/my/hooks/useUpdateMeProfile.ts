import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userProfileQueryKey } from "#/entities/user/hooks/useUser";
import { patchMeProfile, type PatchMeProfileBody } from "#/shared/api/me";
import { getAuthQueryCacheScope } from "#/shared/lib/auth-query-cache-scope";
import { useAuthStore } from "#/shared/store/authStore";

export function useUpdateMeProfile() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: (body: PatchMeProfileBody) => {
      if (!isAuthenticated) {
        throw new Error("Authentication is required.");
      }

      return patchMeProfile(body);
    },
    onSuccess: (data) => {
      const scope = getAuthQueryCacheScope(isAuthenticated, userId);
      queryClient.setQueryData(userProfileQueryKey(scope), data);
    },
  });
}
