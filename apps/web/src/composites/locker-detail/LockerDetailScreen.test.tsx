// @vitest-environment jsdom

import { m } from "@repo/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render as rtlRender, screen } from "@testing-library/react";
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
});
