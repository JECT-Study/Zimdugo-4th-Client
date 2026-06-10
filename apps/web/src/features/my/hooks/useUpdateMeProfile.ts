import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userProfileQueryKey } from "#/entities/user/hooks/useUser";
import { patchMeProfile, type PatchMeProfileBody } from "#/shared/api/me";
import { useAuthStore } from "#/shared/store/authStore";

export function useUpdateMeProfile() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: (body: PatchMeProfileBody) => {
      if (userId == null) {
        throw new Error("User id is required.");
      }

      return patchMeProfile(userId, body);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userProfileQueryKey(userId), data);
    },
  });
}
