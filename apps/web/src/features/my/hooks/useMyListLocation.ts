import { useQuery } from "@tanstack/react-query";
import { getCurrentMapCoordinates } from "#/entities/map/model/current-location";
import {
  MY_LIST_LOCATION_STALE_TIME_MS,
  normalizeMyListLocation,
} from "../lib/my-list-query-options";

const DEFAULT_COORDINATES = { lat: 37.498095, lng: 127.02761 };

export const MY_LIST_LOCATION_QUERY_KEY = "my-list-location";

export function useMyListLocation() {
  return useQuery({
    queryKey: [MY_LIST_LOCATION_QUERY_KEY],
    queryFn: () =>
      getCurrentMapCoordinates()
        .then(normalizeMyListLocation)
        .catch(() => normalizeMyListLocation(DEFAULT_COORDINATES)),
    staleTime: MY_LIST_LOCATION_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
