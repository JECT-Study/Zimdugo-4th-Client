import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { LOCKER_PINS_QUERY_KEY } from "#/entities/map/model/useLockerMarkers";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import { patchFavoriteInQueryCaches } from "./patch-favorite-query-cache";

const createLockerPin = (
  overrides: Partial<
    Extract<LockerPinItemResponse, { pinType: "LOCKER" }>
  > = {},
): Extract<LockerPinItemResponse, { pinType: "LOCKER" }> => ({
  pinType: "LOCKER",
  lockerId: 9,
  placeId: null,
  latitude: 37.5,
  longitude: 127,
  isFavorite: true,
  lockerCount: null,
  pinCount: null,
  bounds: null,
  ...overrides,
});

const createPlacePin = (): Extract<
  LockerPinItemResponse,
  { pinType: "PLACE" }
> => ({
  pinType: "PLACE",
  placeId: 1,
  lockerId: null,
  latitude: 37.5,
  longitude: 127,
  isFavorite: null,
  lockerCount: 3,
  pinCount: null,
  bounds: null,
});

describe("patchFavoriteInQueryCaches", () => {
  it("지도 핀 캐시의 즐겨찾기 상태도 함께 갱신한다", () => {
    const queryClient = new QueryClient();
    const queryKey = [LOCKER_PINS_QUERY_KEY, 37, 127, 38, 128, 15, 1];
    const previousPins = [
      createLockerPin(),
      createLockerPin({ lockerId: 10, isFavorite: true }),
      createPlacePin(),
    ];

    queryClient.setQueryData<LockerPinItemResponse[]>(queryKey, previousPins);

    patchFavoriteInQueryCaches(queryClient, 9, false, 1);

    const nextPins =
      queryClient.getQueryData<LockerPinItemResponse[]>(queryKey);

    expect(nextPins).toEqual([
      expect.objectContaining({ lockerId: 9, isFavorite: false }),
      expect.objectContaining({ lockerId: 10, isFavorite: true }),
      expect.objectContaining({ pinType: "PLACE", isFavorite: null }),
    ]);
    expect(nextPins).not.toBe(previousPins);
  });

  it("does not patch caches from a different auth scope", () => {
    const queryClient = new QueryClient();
    const queryKey = [LOCKER_PINS_QUERY_KEY, 37, 127, 38, 128, 15, "anonymous"];
    const previousPins = [createLockerPin()];

    queryClient.setQueryData<LockerPinItemResponse[]>(queryKey, previousPins);

    patchFavoriteInQueryCaches(queryClient, 9, false, 1);

    expect(queryClient.getQueryData<LockerPinItemResponse[]>(queryKey)).toEqual(
      previousPins,
    );
  });
});
