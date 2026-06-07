import { useQuery } from "@tanstack/react-query";
import {
  toLockerKeywordViewModel,
  toSearchAutocompleteItems,
} from "#/shared/api/locker-adapters";
import {
  getLockerKeyword,
  getLockerSuggest,
  type GetLockerKeywordParams,
  type GetLockerSuggestParams,
} from "#/shared/api/lockers";

export const LOCKER_KEYWORD_QUERY_KEY = "lockerKeyword";
export const LOCKER_SUGGEST_QUERY_KEY = "lockerSuggest";

export function useLockerKeywordSearch(
  params: GetLockerKeywordParams | null,
) {
  return useQuery({
    queryKey: [
      LOCKER_KEYWORD_QUERY_KEY,
      params?.keyword,
      params?.lat,
      params?.lng,
      params?.sizeTypes,
      params?.lockerTypes,
      params?.indoorOutdoorTypes,
      params?.minPrice,
      params?.maxPrice,
      params?.isFree,
    ],
    queryFn: ({ signal }) => {
      if (!params) {
        throw new Error("Locker keyword search params are required.");
      }

      return getLockerKeyword({ ...params, signal }).then(toLockerKeywordViewModel);
    },
    enabled: !!params?.keyword.trim(),
  });
}

export function useLockerSuggest(params: GetLockerSuggestParams | null) {
  return useQuery({
    queryKey: [
      LOCKER_SUGGEST_QUERY_KEY,
      params?.keyword,
      params?.lat,
      params?.lng,
    ],
    queryFn: ({ signal }) => {
      if (!params) {
        throw new Error("Locker suggest params are required.");
      }

      return getLockerSuggest({ ...params, signal }).then((data) =>
        toSearchAutocompleteItems(data.items),
      );
    },
    enabled: !!params?.keyword.trim(),
  });
}
