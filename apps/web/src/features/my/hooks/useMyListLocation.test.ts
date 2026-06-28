import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MapCoordinates } from "#/entities/map/model/current-location";
import { MY_LIST_LOCATION_STALE_TIME_MS } from "../lib/my-list-query-options";

const mocks = vi.hoisted(() => ({
  getCurrentMapCoordinates: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: mocks.useQuery,
}));

vi.mock("#/entities/map/model/current-location", () => ({
  getCurrentMapCoordinates: mocks.getCurrentMapCoordinates,
}));

import { useMyListLocation } from "./useMyListLocation";

interface QueryOptions {
  queryFn: () => Promise<MapCoordinates>;
  staleTime: number;
  refetchOnWindowFocus: boolean;
  retry: boolean;
}

const getQueryOptions = () => {
  const [options] = mocks.useQuery.mock.calls.at(-1) ?? [];
  return options as QueryOptions;
};

describe("useMyListLocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("현재 위치 좌표를 정규화하고 focus refetch를 끈다", async () => {
    mocks.getCurrentMapCoordinates.mockResolvedValue({
      lat: 37.1234567,
      lng: 127.1234567,
    });

    useMyListLocation();

    const options = getQueryOptions();
    await expect(options.queryFn()).resolves.toEqual({
      lat: 37.1235,
      lng: 127.1235,
    });
    expect(options.staleTime).toBe(MY_LIST_LOCATION_STALE_TIME_MS);
    expect(options.refetchOnWindowFocus).toBe(false);
    expect(options.retry).toBe(false);
  });

  it("현재 위치 조회에 실패하면 정규화된 기본 좌표를 반환한다", async () => {
    mocks.getCurrentMapCoordinates.mockRejectedValue(
      new Error("permission denied"),
    );

    useMyListLocation();

    const options = getQueryOptions();
    await expect(options.queryFn()).resolves.toEqual({
      lat: 37.4981,
      lng: 127.0276,
    });
  });
});
