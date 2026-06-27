import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { useAuthStore } from "#/shared/store/authStore";
import { useFavoriteLockerSession } from "./useFavoriteLockerSession";

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

describe("useFavoriteLockerSession", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: "token",
      userId: 1,
      email: "test@example.com",
      provider: "google",
      isAuthenticated: true,
    });
  });

  it("상세 handler는 displayed 값이 아니라 active query server snapshot으로 diff를 계산한다", () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useFavoriteLockerSession(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.toggle(9, false, true);
    });

    act(() => {
      result.current.handleDetailFavoriteChange(
        createLockerDetail({ isFavorite: false }),
        true,
        true,
      );
    });

    expect(result.current.pending.has(9)).toBe(false);
  });
});
