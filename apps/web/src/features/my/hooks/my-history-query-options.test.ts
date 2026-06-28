import { beforeEach, describe, expect, it, vi } from "vitest";
import { MY_HISTORY_LIST_STALE_TIME_MS } from "../lib/my-list-query-options";

const mocks = vi.hoisted(() => ({
  getMyLockerReportHistory: vi.fn(),
  useInfiniteQuery: vi.fn(),
  useMyListLocation: vi.fn(),
  authState: {
    isAuthenticated: true,
    userId: 1,
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: mocks.useInfiniteQuery,
}));

vi.mock("#/shared/api/my-page", () => ({
  getMyLockerReportHistory: mocks.getMyLockerReportHistory,
}));

vi.mock("#/shared/store/authStore", () => ({
  useAuthStore: (
    selector: (state: {
      isAuthenticated: boolean;
      userId: number | null;
    }) => unknown,
  ) => selector(mocks.authState),
}));

vi.mock("./useMyListLocation", () => ({
  useMyListLocation: mocks.useMyListLocation,
}));

import {
  FAVORITE_LOCKER_LIST_QUERY_KEY,
  useFavoriteLockerList,
} from "./useFavoriteLockerList";
import {
  REPORT_HISTORY_LIST_QUERY_KEY,
  useReportHistoryList,
} from "./useReportHistoryList";

interface InfiniteQueryOptions {
  queryKey: unknown[];
  enabled: boolean;
  staleTime: number;
  refetchOnWindowFocus: boolean;
  queryFn: (context: {
    pageParam: number;
    signal?: AbortSignal;
  }) => Promise<unknown>;
}

const getInfiniteQueryOptions = () => {
  const [options] = mocks.useInfiniteQuery.mock.calls.at(-1) ?? [];
  return options as InfiniteQueryOptions;
};

describe("my history query options", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMyLockerReportHistory.mockResolvedValue({
      items: [],
      totalCount: 0,
      hasNext: false,
    });
    mocks.authState.isAuthenticated = true;
    mocks.authState.userId = 1;
    mocks.useMyListLocation.mockReturnValue({
      data: { lat: 37.1235, lng: 127.1235 },
    });
  });

  it("즐겨찾기 히스토리 쿼리에 캐시 유지 옵션을 적용한다", () => {
    useFavoriteLockerList();

    const options = getInfiniteQueryOptions();
    expect(options.queryKey).toEqual([
      FAVORITE_LOCKER_LIST_QUERY_KEY,
      37.1235,
      127.1235,
      1,
    ]);
    expect(options.enabled).toBe(true);
    expect(options.staleTime).toBe(MY_HISTORY_LIST_STALE_TIME_MS);
    expect(options.refetchOnWindowFocus).toBe(false);
  });

  it("제보 히스토리 쿼리에 캐시 유지 옵션을 적용한다", () => {
    useReportHistoryList();

    const options = getInfiniteQueryOptions();
    expect(options.queryKey).toEqual([
      REPORT_HISTORY_LIST_QUERY_KEY,
      37.1235,
      127.1235,
    ]);
    expect(options.enabled).toBe(true);
    expect(options.staleTime).toBe(MY_HISTORY_LIST_STALE_TIME_MS);
    expect(options.refetchOnWindowFocus).toBe(false);
  });

  it("제보 히스토리 queryFn은 페이지 정보와 signal을 전달한다", async () => {
    const signal = new AbortController().signal;
    useReportHistoryList();

    const options = getInfiniteQueryOptions();
    await options.queryFn({ pageParam: 1, signal });

    expect(mocks.getMyLockerReportHistory).toHaveBeenCalledWith({
      lat: 37.1235,
      lng: 127.1235,
      page: 1,
      size: 10,
      signal,
    });
  });

  it("제보 히스토리 queryFn은 위치가 없으면 요청하지 않는다", () => {
    mocks.useMyListLocation.mockReturnValue({ data: undefined });
    useReportHistoryList();

    const options = getInfiniteQueryOptions();
    expect(() => options.queryFn({ pageParam: 0 })).toThrow(
      "Report history list location is required.",
    );
    expect(mocks.getMyLockerReportHistory).not.toHaveBeenCalled();
  });
});
