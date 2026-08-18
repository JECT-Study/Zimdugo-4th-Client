import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import { LOCKER_PINS_QUERY_KEY } from "#/entities/map/model/useLockerMarkers";
import {
  addFavoriteLocker,
  removeFavoriteLocker,
} from "#/shared/api/favorite-lockers";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import { useAuthStore } from "#/shared/store/authStore";
import { useFavoriteLockerSession } from "./useFavoriteLockerSession";

type LockerPinItem = Extract<LockerPinItemResponse, { pinType: "LOCKER" }>;

vi.mock("#/shared/api/favorite-lockers", () => ({
  addFavoriteLocker: vi.fn(),
  removeFavoriteLocker: vi.fn(),
}));

const createWrapper =
  (queryClient: QueryClient) =>
  ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createLockerDetail = (
  overrides: Partial<LockerDetailItem> = {},
): LockerDetailItem => ({
  itemType: "LOCKER",
  lockerId: 9,
  title: "테스트 보관함",
  address: "서울시 테스트구",
  categoryLabel: "지하철역",
  updatedLabel: "방금 업데이트",
  distanceLabel: "100m",
  isFavorite: false,
  ...overrides,
});

const createLockerPin = (
  overrides: Partial<LockerPinItem> = {},
): LockerPinItem => ({
  pinType: "LOCKER",
  lockerId: 9,
  placeId: null,
  latitude: 37.5,
  longitude: 127,
  isFavorite: false,
  lockerCount: null,
  pinCount: null,
  bounds: null,
  ...overrides,
});

describe("useFavoriteLockerSession", () => {
  beforeEach(() => {
    vi.mocked(addFavoriteLocker).mockReset();
    vi.mocked(removeFavoriteLocker).mockReset();
    useAuthStore.setState({
      accessToken: "token",
      userId: 1,
      email: "test@example.com",
      provider: "google",
      isAuthenticated: true,
    });
  });

  it("상세 handler는 displayed 값이 아니라 active query server snapshot으로 diff를 계산한다", async () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useFavoriteLockerSession(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.toggle(9, false, true);
    });

    await act(async () => {
      await result.current.handleDetailFavoriteChange(
        createLockerDetail({ isFavorite: false }),
        true,
        true,
      );
    });

    expect(result.current.pending.has(9)).toBe(false);
    expect(addFavoriteLocker).not.toHaveBeenCalled();
    expect(removeFavoriteLocker).not.toHaveBeenCalled();
  });

  it("상세 즐겨찾기를 누르면 API를 즉시 호출하고 핀 캐시를 갱신한다", async () => {
    const queryClient = createQueryClient();
    const lockerPinsQueryKey = [LOCKER_PINS_QUERY_KEY, "viewport", 1];
    queryClient.setQueryData(lockerPinsQueryKey, [createLockerPin()]);
    vi.mocked(addFavoriteLocker).mockResolvedValue(undefined);
    const { result } = renderHook(() => useFavoriteLockerSession(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.handleDetailFavoriteChange(
        createLockerDetail(),
        true,
        false,
      );
    });

    expect(addFavoriteLocker).toHaveBeenCalledWith(9);
    expect(
      queryClient.getQueryData<LockerPinItemResponse[]>(lockerPinsQueryKey),
    ).toEqual([expect.objectContaining({ lockerId: 9, isFavorite: true })]);
    expect(result.current.pending.has(9)).toBe(false);
  });

  it("상세 즐겨찾기 요청 중 시트를 닫아도 API를 중복 호출하지 않는다", async () => {
    const queryClient = createQueryClient();
    let resolveRequest: () => void = () => undefined;
    vi.mocked(addFavoriteLocker).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = () => resolve();
        }),
    );
    const { result } = renderHook(() => useFavoriteLockerSession(), {
      wrapper: createWrapper(queryClient),
    });
    let detailRequest: Promise<void> | undefined;

    act(() => {
      detailRequest = result.current.handleDetailFavoriteChange(
        createLockerDetail(),
        true,
        false,
      );
    });

    await act(async () => {
      expect(await result.current.flush()).toEqual({ hadChanges: false });
    });
    expect(addFavoriteLocker).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRequest();
      await detailRequest;
    });
  });

  it("상세 즐겨찾기 API가 실패하면 핀 캐시를 서버 상태로 되돌린다", async () => {
    const queryClient = createQueryClient();
    const lockerPinsQueryKey = [LOCKER_PINS_QUERY_KEY, "viewport", 1];
    queryClient.setQueryData(lockerPinsQueryKey, [createLockerPin()]);
    vi.mocked(addFavoriteLocker).mockRejectedValue(new Error("request failed"));
    const { result } = renderHook(() => useFavoriteLockerSession(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.handleDetailFavoriteChange(
        createLockerDetail(),
        true,
        false,
      );
    });

    expect(
      queryClient.getQueryData<LockerPinItemResponse[]>(lockerPinsQueryKey),
    ).toEqual([expect.objectContaining({ lockerId: 9, isFavorite: false })]);
    expect(result.current.pending.has(9)).toBe(false);
  });
});
