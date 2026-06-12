// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: null,
    isPending: false,
    isError: false,
  }),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  useNavigate: () => vi.fn(),
}));

vi.mock("#/features/my/hooks/useInfiniteScrollSentinel", () => ({
  useInfiniteScrollSentinel: () => vi.fn(),
}));

vi.mock("#/features/my/hooks/useReportHistoryList", () => ({
  useReportHistoryList: () => ({
    data: {
      pages: [
        {
          items: [
            {
              reportId: 1,
              lockerName: "신촌역 5번 출구 보관함",
              roadAddress: "서울 서대문구 신촌로 83",
              lockerType: "UNMANNED",
              updatedAt: "2026-06-12T00:00:00Z",
            },
          ],
          totalCount: 1,
        },
      ],
    },
    hasNextPage: false,
    isFetchingNextPage: false,
    isPending: false,
    isError: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
  }),
}));

import { Route } from "./my.reports";

describe("MyReportsPage", () => {
  beforeEach(() => {
    setLanguageTag("ko");
  });

  afterEach(cleanup);

  it("이미지가 없는 제보 목록에는 history 전용 문구만 표시한다", () => {
    const MyReportsPage = Route.options.component as ComponentType;

    render(<MyReportsPage />);

    expect(screen.getByText("이미지 없음")).toBeTruthy();
    expect(screen.queryByText("아직 이미지가 없어요.")).toBeNull();
    expect(screen.queryByText("제보하기를 통해 등록할 수 있어요!")).toBeNull();
  });
});
