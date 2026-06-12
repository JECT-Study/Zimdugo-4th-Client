import { useQuery } from "@tanstack/react-query";
import { getMeProfile, type MeProfileData } from "#/shared/api/me";

export type { MeProfileData };

export const userProfileQueryKey = () => ["me", "profile"] as const;

export function useUser(enabled = true) {
  return useQuery({
    queryKey: userProfileQueryKey(),
    queryFn: ({ signal }) => getMeProfile(signal),
    enabled,
  });
}
