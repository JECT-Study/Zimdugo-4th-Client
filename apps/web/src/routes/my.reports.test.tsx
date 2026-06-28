// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  useReportHistoryList: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: mocks.useQuery,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  useNavigate: () => vi.fn(),
}));

vi.mock("#/features/my/hooks/useInfiniteScrollSentinel", () => ({
  useInfiniteScrollSentinel: () => vi.fn(),
}));

vi.mock("#/features/my/hooks/useReportHistoryList", () => ({
  useReportHistoryList: mocks.useReportHistoryList,
}));

import { Route } from "./my.reports";

const reportHistoryItem = {
  reportId: 1,
  lockerName: "홍대입구역 5번 출구 보관함",
  roadAddress: "서울 마포구 양화로 83",
  lockerType: "UNMANNED",
  updatedAt: "2026-06-12T00:00:00Z",
};

const setReportHistoryState = ({
  items = [reportHistoryItem],
  totalCount = items.length,
  isPending = false,
  isError = false,
}: {
  items?: (typeof reportHistoryItem)[];
  totalCount?: number;
  isPending?: boolean;
  isError?: boolean;
} = {}) => {
  mocks.useReportHistoryList.mockReturnValue({
    data: isPending
      ? undefined
      : {
          pages: [
            {
              items,
              totalCount,
            },
          ],
        },
    hasNextPage: false,
    isFetchingNextPage: false,
    isPending,
    isError,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
  });
};

describe("MyReportsPage", () => {
  beforeEach(() => {
    setLanguageTag("ko", { reload: false });
    mocks.useQuery.mockReturnValue({
      data: null,
      isPending: false,
      isError: false,
    });
    setReportHistoryState();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("이미지가 없는 제보 목록에는 history 전용 문구만 표시한다", () => {
    const MyReportsPage = Route.options.component as ComponentType;

    render(<MyReportsPage />);

    expect(screen.getByText("이미지 없음")).toBeTruthy();
    expect(screen.queryByText("아직 이미지가 없어요")).toBeNull();
    expect(screen.queryByText("제보하기를 통해 등록할 수 있어요!")).toBeNull();
  });

  it("초기 로딩 중에는 텍스트 대신 스켈레톤 리스트를 표시한다", () => {
    setReportHistoryState({ isPending: true, items: [], totalCount: 0 });
    const MyReportsPage = Route.options.component as ComponentType;

    const { container } = render(<MyReportsPage />);

    expect(screen.queryByLabelText("제보 히스토리 목록")).toBeNull();
    expect(screen.getByRole("status")).toBeTruthy();
    expect(
      container.querySelectorAll('[aria-hidden="true"]').length,
    ).toBeGreaterThan(5);
  });

  it("제보 히스토리 빈 상태에는 제보용 영문 보조문구를 함께 표시한다", () => {
    setReportHistoryState({ items: [], totalCount: 0 });
    const MyReportsPage = Route.options.component as ComponentType;

    render(<MyReportsPage />);

    expect(screen.getByText("제보 히스토리가 없어요")).toBeTruthy();
    expect(screen.getByText("No report history yet")).toBeTruthy();
    expect(
      screen.getByText("Report lockers and review them here"),
    ).toBeTruthy();
  });

  it("설정 언어가 영어일 때는 영문 보조문구를 중복 노출하지 않는다", () => {
    setLanguageTag("en", { reload: false });
    setReportHistoryState({ items: [], totalCount: 0 });
    const MyReportsPage = Route.options.component as ComponentType;

    render(<MyReportsPage />);

    expect(screen.getAllByText("No report history yet")).toHaveLength(1);
    expect(
      screen.queryByText("Report lockers and review them here"),
    ).toBeNull();
  });
});
