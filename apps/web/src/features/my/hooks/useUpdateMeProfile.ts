import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userProfileQueryKey } from "#/entities/user/hooks/useUser";
import { patchMeProfile, type PatchMeProfileBody } from "#/shared/api/me";
import { useAuthStore } from "#/shared/store/authStore";

export function useUpdateMeProfile() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useMutation({
    mutationFn: (body: PatchMeProfileBody) => {
      if (!isAuthenticated) {
        throw new Error("Authentication is required.");
      }

      return patchMeProfile(body);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userProfileQueryKey(), data);
    },
  });
}
