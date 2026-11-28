// @vitest-environment jsdom

import { m } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render as rtlRender,
  screen,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import { PUSH_REMINDER_QUERY_KEY } from "#/features/locker-timer/model/push-reminder-queries";
import { setTestLanguage } from "#/shared/test/language-runtime";

/**
 * 화면이 표면을 직접 렌더하면 이 가짜가 던진다.
 *
 * 그냥 렌더해 보는 것만으로는 부족하다. 화면이 시트를 다시 품어도 시트가 자식을
 * 그려 주므로 통과한다. 표면을 쓰는 순간 실패하도록 두어야 분리가 지켜진다.
 */
vi.mock("#/shared/ui/DraggableBottomSheet", () => ({
  DraggableBottomSheet: () => {
    throw new Error("화면이 표면(DraggableBottomSheet)을 직접 렌더하고 있다");
  },
  resolveBottomSheetExpandedProgress: () => 1,
  SHEET_SETTLE_SPRING: {},
}));

import { LockerDetailScreen } from "./LockerDetailScreen";

let queryClient = new QueryClient();

const render = (ui: ReactNode) =>
  rtlRender(ui, {
    wrapper: ({ children }: { children?: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

const LOCKER_DETAIL: LockerDetailItem = {
  itemType: "LOCKER",
  lockerId: 11,
  title: "신촌역 5번 출구 B2층 물품보관함",
  categoryLabel: "지하철역",
  updatedLabel: "4시간 전 업데이트",
  distanceLabel: "210m",
  address: "서울 서대문구 신촌로 83",
  floorLabel: "B2층",
  priceLabel: "가격 미제공",
  sizeLabel: "S / M / L / 기타",
  accurateCount: 78,
  inaccurateCount: 5,
  lastUpdatedLabel: "최근 업데이트 2026-05-16 16:25",
};

beforeEach(() => {
  setTestLanguage("ko");
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(PUSH_REMINDER_QUERY_KEY, []);
});

afterEach(cleanup);

describe("LockerDetailScreen", () => {
  it("표면 없이 혼자 선다", () => {
    render(<LockerDetailScreen locker={LOCKER_DETAIL} />);

    expect(screen.getByText(LOCKER_DETAIL.address)).toBeTruthy();
    expect(screen.getByText(m.locker_detail_navigate())).toBeTruthy();
  });

  /**
   * 시트가 콘텐츠 위에 두는 자리는 표면이 더한다. 화면이 함께 더하면 특정 표면의
   * 치수를 아는 셈이 된다.
   */
  it("잰 자리를 표면에 올려보낸다", () => {
    const handleMetricsChange = vi.fn();

    render(
      <LockerDetailScreen
        locker={LOCKER_DETAIL}
        onMetricsChange={handleMetricsChange}
      />,
    );

    expect(handleMetricsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        actionFooterHeightPx: expect.any(Number),
      }),
    );
  });

  it("잴 것이 없으면 높이 대신 null 을 올려보낸다", () => {
    const handleMetricsChange = vi.fn();

    render(
      <LockerDetailScreen
        locker={LOCKER_DETAIL}
        loadState="loading"
        onMetricsChange={handleMetricsChange}
      />,
    );

    expect(handleMetricsChange).toHaveBeenCalledWith(
      expect.objectContaining({ contentHeightPx: null }),
    );
  });

  /**
   * 표면이 액션 영역을 놓을 자리가 없다고 하면 화면은 그 영역을 그리지 않는다.
   * 단계 이름(full·half·mini)을 화면이 알 필요는 없다.
   */
  it("자리가 없다고 하면 액션 영역을 그리지 않는다", () => {
    render(
      <LockerDetailScreen
        locker={LOCKER_DETAIL}
        isActionFooterVisible={false}
      />,
    );

    expect(screen.queryByText(m.locker_detail_navigate())).toBeNull();
  });

  /**
   * 시트는 보관함마다 새로 마운트되지 않는다. 열려 있던 정정 요청을 그대로 두면
   * 제출 콜백이 지금 보고 있는 보관함을 써서, A 에서 연 모달이 B 의 정정 요청으로
   * 나갈 수 있다.
   */
  it("보관함이 바뀌면 열려 있던 더보기 메뉴를 접는다", () => {
    const { rerender } = render(<LockerDetailScreen locker={LOCKER_DETAIL} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: m.locker_detail_more_actions_open_aria(),
      }),
    );
    expect(screen.queryByRole("dialog")).not.toBeNull();

    // 래퍼로 다시 감싸면 그 자리의 요소 타입이 달라져 트리가 통째로 리마운트된다.
    // 그러면 이펙트와 무관하게 상태가 초기화돼 이 테스트가 헛돈다.
    rerender(
      <LockerDetailScreen
        locker={{ ...LOCKER_DETAIL, lockerId: 12, title: "다른 보관함" }}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("LockerDetailScreen 데스크톱 패널", () => {
  it("길찾기·공유하기·신고하기를 칩 줄로 두고 더보기와 타이머는 두지 않는다", () => {
    render(<LockerDetailScreen locker={LOCKER_DETAIL} variant="panel" />);

    expect(
      screen.getByRole("button", { name: m.locker_detail_navigate() }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: m.locker_detail_share_aria() }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: m.locker_detail_report() }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: m.locker_detail_more_actions_open_aria(),
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: m.locker_timer_set() }),
    ).toBeNull();
  });

  it("공유하기와 길찾기 칩은 보고 있는 보관함을 넘긴다", () => {
    const onShare = vi.fn();
    const onNavigate = vi.fn();
    render(
      <LockerDetailScreen
        locker={LOCKER_DETAIL}
        variant="panel"
        onShare={onShare}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: m.locker_detail_share_aria() }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: m.locker_detail_navigate() }),
    );

    expect(onShare).toHaveBeenCalledWith(LOCKER_DETAIL);
    expect(onNavigate).toHaveBeenCalledWith(LOCKER_DETAIL);
  });

  it("신고하기를 누르면 칩이 펼친 상태로 바뀐다", () => {
    render(<LockerDetailScreen locker={LOCKER_DETAIL} variant="panel" />);
    const reportChip = screen.getByRole("button", {
      name: m.locker_detail_report(),
    });

    expect(reportChip.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(reportChip);
    expect(reportChip.getAttribute("aria-expanded")).toBe("true");
  });

  it("즐겨찾기를 쓸 수 있으면 요약 옆에 별 버튼을 두고 누르면 뒤집는다", () => {
    const onFavoriteChange = vi.fn();
    render(
      <LockerDetailScreen
        locker={{ ...LOCKER_DETAIL, isFavorite: false }}
        variant="panel"
        isFavoriteActionVisible
        onFavoriteChange={onFavoriteChange}
      />,
    );

    const star = screen.getByRole("button", { name: m.search_favorite_add() });
    expect(star.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(star);

    expect(onFavoriteChange).toHaveBeenCalledWith(
      expect.objectContaining({ lockerId: LOCKER_DETAIL.lockerId }),
      true,
    );
  });

  it("즐겨찾기를 쓸 수 없으면 별 버튼을 두지 않는다", () => {
    render(<LockerDetailScreen locker={LOCKER_DETAIL} variant="panel" />);

    expect(
      screen.queryByRole("button", { name: m.search_favorite_add() }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: m.search_close_aria() }),
    ).toBeTruthy();
  });
});

describe("LockerDetailScreen 상세 정보 그래픽", () => {
  it("상세 정보에서 크기별 개수·요금을 읽으면 가격·사이즈·상세 정보 행 대신 그림으로 보여 준다", () => {
    render(
      <LockerDetailScreen
        locker={{
          ...LOCKER_DETAIL,
          detailHelpText:
            "- 상세위치: 대합실\n- 보관함 개수: 중형 9개 / 소형 36개\n- 이용요금: 중형 3,000원 / 소형 2,000원 (4시간 당)",
        }}
      />,
    );

    expect(
      screen.getByRole("region", { name: m.locker_detail_info_section() }),
    ).toBeTruthy();
    expect(screen.getByText("36칸")).toBeTruthy();
    expect(screen.queryByText(m.locker_detail_price_section())).toBeNull();
    expect(screen.queryByText(m.locker_detail_size_section())).toBeNull();
  });

  it("상세 정보를 읽지 못하면 지금처럼 문장 행을 그대로 둔다", () => {
    render(
      <LockerDetailScreen
        locker={{ ...LOCKER_DETAIL, detailHelpText: "개찰구를 지나 왼쪽" }}
      />,
    );

    expect(screen.getByText(m.locker_detail_price_section())).toBeTruthy();
    expect(screen.getByText("개찰구를 지나 왼쪽")).toBeTruthy();
  });

  it("요금을 하나도 읽지 못하면 그림과 함께 가격 행을 남긴다", () => {
    render(
      <LockerDetailScreen
        locker={{
          ...LOCKER_DETAIL,
          priceLabel: "2,000원 ~ 4,000원",
          detailHelpText: "- 보관함 개수: 소형 36개 / 중형 8개",
        }}
      />,
    );

    expect(screen.getByText("36칸")).toBeTruthy();
    expect(screen.getByText(m.locker_detail_price_section())).toBeTruthy();
    expect(screen.getByText("2,000원 ~ 4,000원")).toBeTruthy();
    expect(screen.queryByText(m.locker_detail_size_section())).toBeNull();
  });

  it("개수를 하나도 읽지 못하면 그림과 함께 사이즈 행을 남긴다", () => {
    render(
      <LockerDetailScreen
        locker={{
          ...LOCKER_DETAIL,
          detailHelpText: "- 이용요금: 소형 2,000원 / 중형 3,000원",
        }}
      />,
    );

    expect(screen.getByText("2,000원")).toBeTruthy();
    expect(screen.getByText(m.locker_detail_size_section())).toBeTruthy();
    expect(screen.queryByText(m.locker_detail_price_section())).toBeNull();
  });

  it("데스크톱 패널은 그림이 있으면 실시간 카드 대신 그림에 크기마다 남은 칸을 모두 보여 준다", () => {
    const locker = {
      ...LOCKER_DETAIL,
      // 개수 줄에는 소형만 있고 요금 줄에 중형이 있다. 중형의 전체 칸 수는 모른다.
      detailHelpText:
        "- 보관함 개수: 소형 36개\n- 이용요금: 소형 2,000원 / 중형 3,000원",
      realtimeAvailability: {
        isAvailable: true,
        smallAvailableCount: 12,
        mediumAvailableCount: 2,
        largeAvailableCount: 0,
        fetchedAt: "2026-11-28T10:00:00",
      },
    };
    const { rerender } = render(
      <LockerDetailScreen locker={locker} variant="panel" />,
    );

    expect(
      screen.queryByRole("region", { name: "실시간 이용 가능" }),
    ).toBeNull();
    expect(screen.getByText("12/36칸 남음")).toBeTruthy();
    expect(screen.getByText("2칸 남음")).toBeTruthy();

    // 모바일 시트는 실시간 카드를 그대로 둔다.
    rerender(<LockerDetailScreen locker={locker} />);
    expect(
      screen.getByRole("region", { name: "실시간 이용 가능" }),
    ).toBeTruthy();
  });
});
