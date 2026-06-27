import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LockerDetailItem } from "#/composites/search/LockerDetailBottomSheet";
import { postLockerVote } from "#/shared/api/locker-votes";
import { useAuthStore } from "#/shared/store/authStore";
import { LOCKER_DETAIL_QUERY_KEY } from "./useLockerDetail";
import { useVoteLockerSession } from "./useVoteLockerSession";

vi.mock("#/shared/api/locker-votes", () => ({
  postLockerVote: vi.fn(),
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
  accurateCount: 1,
  inaccurateCount: 0,
  isAccurateVoted: false,
  isInaccurateVoted: false,
  ...overrides,
});

describe("useVoteLockerSession", () => {
  beforeEach(() => {
    vi.mocked(postLockerVote).mockReset();
    vi.mocked(postLockerVote).mockResolvedValue(undefined);
    useAuthStore.setState({
      accessToken: "token",
      userId: 1,
      email: "test@example.com",
      provider: "google",
      isAuthenticated: true,
    });
  });

  it("flush 성공 시 invalidate 없이 진행 중 상세 쿼리를 취소한 뒤 패치한다", async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const cancelSpy = vi.spyOn(queryClient, "cancelQueries");
    const queryKey = [LOCKER_DETAIL_QUERY_KEY, 9, 37.5, 127.0, "user:1"];

    queryClient.setQueryData(queryKey, createLockerDetail());

    const { result } = renderHook(() => useVoteLockerSession(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.toggle(9, "CORRECT", {
        isAccurateVoted: false,
        isInaccurateVoted: false,
      });
    });

    await act(async () => {
      await result.current.flush();
    });

    expect(postLockerVote).toHaveBeenCalledWith(9, "CORRECT");
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(cancelSpy).toHaveBeenCalledWith({
      queryKey: [LOCKER_DETAIL_QUERY_KEY, 9],
    });
    expect(queryClient.getQueryData<LockerDetailItem>(queryKey)).toMatchObject({
      isAccurateVoted: true,
      isInaccurateVoted: false,
      accurateCount: 2,
      inaccurateCount: 0,
    });
    expect(result.current.pending.size).toBe(0);
  });

  it("상세 handler는 displayed 값이 아니라 active query server snapshot으로 diff를 계산한다", () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useVoteLockerSession(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.toggle(9, "CORRECT", {
        isAccurateVoted: true,
        isInaccurateVoted: false,
      });
    });

    act(() => {
      result.current.handleDetailVoteChange(
        createLockerDetail({
          isAccurateVoted: false,
          isInaccurateVoted: false,
        }),
        "CORRECT",
        {
          isAccurateVoted: true,
          isInaccurateVoted: false,
        },
      );
    });

    expect(result.current.pending.has(9)).toBe(false);
  });
});
