import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { LOCKER_PINS_QUERY_KEY } from "#/entities/map/model/useLockerMarkers";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import { LOCKER_DETAIL_QUERY_KEY } from "../hooks/useLockerDetail";
import {
  LOCKER_SEARCH_QUERY_KEY,
  PLACE_LOCKERS_QUERY_KEY,
} from "../hooks/useSearch";
import {
  cancelFavoriteQueryCaches,
  patchFavoriteInQueryCaches,
} from "./patch-favorite-query-cache";

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
  it("낙관적 패치 대상인 현재 사용자 쿼리만 취소한다", async () => {
    const queryClient = new QueryClient();
    const targetQueryKeys = [
      [LOCKER_SEARCH_QUERY_KEY, "params", 1],
      [PLACE_LOCKERS_QUERY_KEY, 1, 1],
      [LOCKER_DETAIL_QUERY_KEY, 9, 1],
      [LOCKER_PINS_QUERY_KEY, "viewport", 1],
    ] as const;
    const preservedQueryKeys = [
      [LOCKER_DETAIL_QUERY_KEY, 10, 1],
      [LOCKER_PINS_QUERY_KEY, "viewport", 2],
    ] as const;
    const queryPromises = [...targetQueryKeys, ...preservedQueryKeys].map(
      (queryKey) =>
        queryClient
          .fetchQuery({
            queryKey,
            queryFn: ({ signal }) =>
              new Promise<void>((_resolve, reject) => {
                signal.addEventListener("abort", () => reject(signal.reason));
              }),
          })
          .catch(() => undefined),
    );

    await cancelFavoriteQueryCaches(queryClient, 9, 1);

    for (const queryKey of targetQueryKeys) {
      expect(queryClient.getQueryState(queryKey)?.fetchStatus).toBe("idle");
    }
    for (const queryKey of preservedQueryKeys) {
      expect(queryClient.getQueryState(queryKey)?.fetchStatus).toBe("fetching");
    }

    await queryClient.cancelQueries();
    await Promise.all(queryPromises);
  });

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

  it("인증 범위가 다른 캐시는 덧대지 않는다", () => {
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
