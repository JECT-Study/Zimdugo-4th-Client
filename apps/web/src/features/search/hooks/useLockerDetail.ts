import { useQuery } from "@tanstack/react-query";
import { toLockerDetailItem } from "#/shared/api/locker-adapters";
import {
  getLockerDetail,
  type GetLockerDetailParams,
} from "#/shared/api/lockers";

export const LOCKER_DETAIL_QUERY_KEY = "lockerDetail";

export function useLockerDetail(params: GetLockerDetailParams | null) {
  return useQuery({
    queryKey: [
      LOCKER_DETAIL_QUERY_KEY,
      params?.lockerId,
      params?.lat,
      params?.lng,
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
