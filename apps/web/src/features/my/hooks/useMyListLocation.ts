import { useQuery } from "@tanstack/react-query";
import { getCurrentMapCoordinates } from "#/entities/map/model/current-location";

const DEFAULT_COORDINATES = { lat: 37.498095, lng: 127.02761 };

export const MY_LIST_LOCATION_QUERY_KEY = "my-list-location";

export function useMyListLocation() {
  return useQuery({
    queryKey: [MY_LIST_LOCATION_QUERY_KEY],
    queryFn: () =>
      getCurrentMapCoordinates().catch(() => DEFAULT_COORDINATES),
    staleTime: 60_000,
    retry: false,
  });
}
