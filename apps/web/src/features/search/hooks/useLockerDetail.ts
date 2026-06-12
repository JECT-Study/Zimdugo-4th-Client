import { useQuery } from "@tanstack/react-query";
import { toLockerDetailItem } from "#/shared/api/locker-adapters";
import {
  getLockerDetail,
  type GetLockerDetailParams,
} from "#/shared/api/lockers";
import { useAuthStore } from "#/shared/store/authStore";

export const LOCKER_DETAIL_QUERY_KEY = "lockerDetail";

export function useLockerDetail(params: GetLockerDetailParams | null) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: [
      LOCKER_DETAIL_QUERY_KEY,
      params?.lockerId,
      params?.lat,
      params?.lng,
      isAuthenticated,
    ],
    queryFn: ({ signal }) => {
      if (!params) {
        throw new Error("Locker detail params are required.");
      }

      return getLockerDetail({ ...params, signal }).then(toLockerDetailItem);
    },
    enabled: params != null,
  });
}
