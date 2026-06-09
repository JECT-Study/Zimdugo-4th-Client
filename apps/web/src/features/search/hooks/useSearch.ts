import { useQuery } from "@tanstack/react-query";
import {
  toLockerKeywordViewModel,
  toPlaceLockersViewModel,
  toSearchAutocompleteItems,
} from "#/shared/api/locker-adapters";
import {
  getLockerKeyword,
  getLockerSuggest,
  getPlaceLockers,
  type GetLockerKeywordParams,
  type GetLockerSuggestParams,
  type GetPlaceLockersParams,
} from "#/shared/api/lockers";

export const LOCKER_KEYWORD_QUERY_KEY = "lockerKeyword";
export const LOCKER_SUGGEST_QUERY_KEY = "lockerSuggest";
export const PLACE_LOCKERS_QUERY_KEY = "placeLockers";

export function useLockerKeywordSearch(params: GetLockerKeywordParams | null) {
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

      return getLockerKeyword({ ...params, signal }).then(
        toLockerKeywordViewModel,
      );
    },
    enabled: !!params?.keyword?.trim(),
  });
}

export function usePlaceLockers(params: GetPlaceLockersParams | null) {
  return useQuery({
    queryKey: [
      PLACE_LOCKERS_QUERY_KEY,
      params?.placeId,
      params?.lat,
      params?.lng,
      params?.sizeTypes,
      params?.lockerTypes,
      params?.indoorOutdoorTypes,
    ],
    queryFn: ({ signal }) => {
      if (!params) {
        throw new Error("Place lockers params are required.");
      }

      return getPlaceLockers({ ...params, signal }).then(
        toPlaceLockersViewModel,
      );
    },
    enabled: params != null,
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
    enabled: !!params?.keyword?.trim(),
  });
}
