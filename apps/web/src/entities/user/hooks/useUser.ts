import { useQuery } from "@tanstack/react-query";
import { getMeProfile, type MeProfileData } from "#/shared/api/me";

export type { MeProfileData };

export const userProfileQueryKey = (userId: number | null | undefined) =>
  ["me", "profile", userId] as const;

export function useUser(userId: number | null | undefined) {
  return useQuery({
    queryKey: userProfileQueryKey(userId),
    queryFn: ({ signal }) => {
      if (userId == null) {
        throw new Error("User id is required.");
      }

      return getMeProfile(userId, signal);
    },
    enabled: userId != null,
  });
}
