// @vitest-environment jsdom

import { m } from "@repo/i18n";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setTestLanguage } from "#/shared/test/language-runtime";

const draggableBottomSheetMock = vi.hoisted(() => vi.fn());

vi.mock("#/shared/ui/DraggableBottomSheet", () => ({
  SHEET_SETTLE_SPRING: { type: "spring" },
  DraggableBottomSheet: (props: {
    animateOnMount?: boolean;
    children: ReactNode;
    initialSnapPoint?: number;
    maxSnapPoint?: number;
    miniSnapPoint?: number;
    minSnapPoint?: number;
    onSnapChange?: (nextSnap: number) => void;
    onLiveOffsetChange?: (state: {
      offset: number;
      expandedProgress: number;
      snapPoints: number[];
    }) => void;
    snapPoint?: number;
    snapRequest?: { id: number; snapPoint: number } | null;
  }) => {
    draggableBottomSheetMock(props);
    return (
      <div data-testid="mock-draggable-bottom-sheet">{props.children}</div>
    );
  },
}));

vi.mock("#/shared/ui/OverflowMarqueeText", async () => {
  const { useEffect } = await import("react");

  return {
    OverflowMarqueeText: ({
      text,
      onOverflowChange,
    }: {
      text: string;
      onOverflowChange?: (isOverflowing: boolean) => void;
    }) => {
      useEffect(() => {
        const timerId = window.setTimeout(() => {
          onOverflowChange?.(true);
        }, 0);

        return () => window.clearTimeout(timerId);
      }, [onOverflowChange]);

      return <span>{text}</span>;
    },
  };
});

import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import {
  LOCKER_DETAIL_FULL_TOP_OFFSET,
  LockerDetailBottomSheet,
  resolveLockerDetailFullSnapPoint,
  resolveLockerDetailSnapPoints,
} from "./LockerDetailBottomSheet";

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
  realtimeAvailability: {
    isAvailable: true,
    smallAvailableCount: 12,
    mediumAvailableCount: 2,
    largeAvailableCount: 0,
    fetchedAt: "2026-08-14T14:19:47.013473",
  },
};

const getSheetRoot = () =>
  within(screen.getByTestId("mock-draggable-bottom-sheet"));

/**
 * 오버레이 카드는 시트와 같은 100dvh 기준으로 배치된다(간격 14px).
 * jsdom 이 calc 를 이 순서로 직렬화한다.
 */
const overlayBottomAt = (sheetOffset: number) =>
  `calc(100dvh + 14px - ${sheetOffset}px)`;

describe("LockerDetailBottomSheet", () => {
  beforeEach(() => {
    setTestLanguage("ko");
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 812,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get: () => 900,
    });
    Object.defineProperty(globalThis, "CSS", {
      configurable: true,
      value: {
        escape: (value: string) => value,
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    draggableBottomSheetMock.mockClear();
  });

  it("resolves detail-specific mini and half snap heights", () => {
    expect(resolveLockerDetailSnapPoints({ windowHeight: 812 })).toEqual({
      maxSnapPoint: 760,
      miniSnapPoint: 701,
      minSnapPoint: 112,
      snapPoint: 621,
    });
  });

  it("caps the full snap height on tall viewports", () => {
    expect(resolveLockerDetailSnapPoints({ windowHeight: 1000 })).toEqual({
      maxSnapPoint: 948,
      miniSnapPoint: 889,
      minSnapPoint: 112,
      snapPoint: 809,
    });
  });

  it("uses the search bar bottom as the maximum full snap height", () => {
    expect(
      resolveLockerDetailFullSnapPoint({
        contentHeight: 320,
        maxSnapPoint: 760,
        minSnapPoint: LOCKER_DETAIL_FULL_TOP_OFFSET,
        windowHeight: 812,
      }),
    ).toBe(492);
    expect(
      resolveLockerDetailFullSnapPoint({
        contentHeight: 900,
        maxSnapPoint: 760,
        minSnapPoint: LOCKER_DETAIL_FULL_TOP_OFFSET,
        windowHeight: 812,
      }),
    ).toBe(LOCKER_DETAIL_FULL_TOP_OFFSET);
  });

  it("하프 시트에서는 실시간 카드를 시트 바깥에 렌더링한다", () => {
    render(
      <LockerDetailBottomSheet locker={LOCKER_DETAIL} onReport={vi.fn()} />,
    );
    const sheet = getSheetRoot();

    expect(sheet.queryByText("최근 업데이트 2026-05-16 16:25")).toBeNull();
    expect(sheet.getByText(LOCKER_DETAIL.title)).toBeTruthy();
    expect(sheet.getAllByText("가격").length).toBeGreaterThan(0);
    expect(sheet.getByText("사이즈")).toBeTruthy();
    expect(sheet.getByText("보관함 상세 정보")).toBeTruthy();
    expect(
      sheet.queryByRole("region", { name: "실시간 이용 가능" }),
    ).toBeNull();
    const realtimeStatusCard = screen.getByRole("region", {
      name: "실시간 이용 가능",
    });
    expect(realtimeStatusCard.parentElement?.style.bottom).toBe(
      overlayBottomAt(621),
    );
    expect(within(realtimeStatusCard).getByText("소형")).toBeTruthy();
    expect(within(realtimeStatusCard).getByText("12")).toBeTruthy();
    expect(within(realtimeStatusCard).getByText("마감")).toBeTruthy();
    expect(sheet.getByRole("separator")).toBeTruthy();
    expect(
      sheet.getByRole("button", { name: "더보기 메뉴 열기" }),
    ).toBeTruthy();
    expect(sheet.getByRole("button", { name: "길찾기" })).toBeTruthy();
  });

  it("풀 시트에서는 실시간 카드를 시트 내부에 렌더링한다", () => {
    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        initialSnapPoint={LOCKER_DETAIL_FULL_TOP_OFFSET}
        onReport={vi.fn()}
      />,
    );

    const sheet = getSheetRoot();
    const realtimeStatusCard = sheet.getByRole("region", {
      name: "실시간 이용 가능",
    });
    const realtimeAvailabilityDivider = sheet.getByRole("separator");

    expect(realtimeStatusCard.parentElement?.nextElementSibling).toBe(
      realtimeAvailabilityDivider,
    );
    expect(
      screen.queryAllByRole("region", { name: "실시간 이용 가능" }),
    ).toHaveLength(1);
  });

  it("미리보기를 닫으면 열었던 사진 버튼으로 포커스를 되돌린다", () => {
    render(
      <LockerDetailBottomSheet
        locker={{
          ...LOCKER_DETAIL,
          images: ["https://example.com/locker.jpg"],
        }}
        onReport={vi.fn()}
      />,
    );

    const imageButton = screen.getByRole("button", {
      name: "보관함 사진 1 / 1",
    });
    fireEvent.click(imageButton);

    const dialog = screen.getByRole("dialog", {
      name: m.report_section_photo(),
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));

    expect(document.activeElement).toBe(imageButton);
  });

  it("열었던 사진이 깨져 버튼이 사라지면 남은 사진으로 포커스를 옮긴다", () => {
    render(
      <LockerDetailBottomSheet
        locker={{
          ...LOCKER_DETAIL,
          images: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
        }}
        onReport={vi.fn()}
      />,
    );

    const stripImages = () =>
      Array.from(getSheetRoot().getByRole("list").querySelectorAll("img"));

    fireEvent.click(screen.getByRole("button", { name: "보관함 사진 1 / 2" }));

    // 미리보기를 연 사이 그 사진이 깨지면 스트립의 버튼이 실패 자리로 바뀐다.
    fireEvent.error(stripImages()[0]);

    const dialog = screen.getByRole("dialog", {
      name: m.report_section_photo(),
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "보관함 사진 2 / 2" }),
    );
  });

  it("스냅 애니메이션 중에는 라이브 오프셋을 따라 오버레이 카드가 움직인다", async () => {
    render(
      <LockerDetailBottomSheet locker={LOCKER_DETAIL} onReport={vi.fn()} />,
    );
    const emitLiveOffset = (offset: number) => {
      act(() => {
        draggableBottomSheetMock.mock.lastCall?.[0].onLiveOffsetChange?.({
          offset,
          expandedProgress: 0,
          snapPoints: [],
        });
      });
    };
    const emitSnapChange = (nextSnap: number) => {
      act(() => {
        draggableBottomSheetMock.mock.lastCall?.[0].onSnapChange?.(nextSnap);
      });
    };
    const getOverlay = () => {
      const sheet = screen.getByTestId("mock-draggable-bottom-sheet");

      return (
        screen
          .getAllByRole("region", { name: "실시간 이용 가능" })
          .find((card) => !sheet.contains(card))?.parentElement ?? null
      );
    };

    // 스프링은 놓는 순간 타깃을 잡고(onSnapChange), 그 뒤에 오프셋이 따라간다.
    emitSnapChange(LOCKER_DETAIL_FULL_TOP_OFFSET);

    // 위치는 motion value 가 다음 프레임에 스타일로 반영한다.
    emitLiveOffset(500);
    await waitFor(() => {
      expect(getOverlay()?.style.bottom).toBe(overlayBottomAt(500));
    });

    emitLiveOffset(300);
    await waitFor(() => {
      expect(getOverlay()?.style.bottom).toBe(overlayBottomAt(300));
    });

    // 타깃에 안착한 뒤에야 시트 내부 카드로 넘긴다.
    emitLiveOffset(LOCKER_DETAIL_FULL_TOP_OFFSET);
    expect(getOverlay()).toBeNull();
    expect(
      getSheetRoot().getByRole("region", { name: "실시간 이용 가능" }),
    ).toBeTruthy();
  });

  it("라이브 오프셋이 프레임마다 바뀌어도 시트를 리렌더하지 않는다", () => {
    render(
      <LockerDetailBottomSheet locker={LOCKER_DETAIL} onReport={vi.fn()} />,
    );
    const renderCountBefore = draggableBottomSheetMock.mock.calls.length;

    // 하프(621)에서 위로 끌어올리는 중. 타깃을 넘지 않아 판정은 그대로다.
    for (const offset of [600, 580, 560, 540, 520]) {
      act(() => {
        draggableBottomSheetMock.mock.lastCall?.[0].onLiveOffsetChange?.({
          offset,
          expandedProgress: 0,
          snapPoints: [],
        });
      });
    }

    // 위치는 motion value 가 직접 쓰므로 리렌더가 늘지 않아야 한다.
    expect(draggableBottomSheetMock.mock.calls.length).toBe(renderCountBefore);
  });

  it("라이브 오프셋을 부모로 올려주고 그때도 리렌더하지 않는다", () => {
    const handleLiveOffsetChange = vi.fn();
    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        onLiveOffsetChange={handleLiveOffsetChange}
        onReport={vi.fn()}
      />,
    );
    const renderCountBefore = draggableBottomSheetMock.mock.calls.length;

    for (const offset of [600, 560, 520]) {
      act(() => {
        draggableBottomSheetMock.mock.lastCall?.[0].onLiveOffsetChange?.({
          offset,
          expandedProgress: 0,
          snapPoints: [],
        });
      });
    }

    // 지도 컨트롤이 시트 윗변을 따라오려면 이 값이 프레임마다 올라와야 한다.
    expect(handleLiveOffsetChange.mock.calls.map(([state]) => state)).toEqual([
      { offsetPx: 600 },
      { offsetPx: 560 },
      { offsetPx: 520 },
    ]);
    // 부모가 motion value 로 받으므로 시트는 여전히 리렌더되지 않는다.
    expect(draggableBottomSheetMock.mock.calls.length).toBe(renderCountBefore);
  });

  it("full 진입으로 콘텐츠가 늘어 minSnapPoint 가 내려가도 내부 카드로 넘긴다", async () => {
    // 제목 펼치기 버튼은 full 에서만 붙어 콘텐츠를 5px 늘린다(브라우저 실측).
    const TITLE_EXPAND_BUTTON_GROWTH = 5;
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get(this: HTMLElement) {
        const hasExpandButton =
          this.querySelector(
            `[aria-label="${m.locker_detail_title_expand_aria()}"]`,
          ) !== null;
        return 400 + (hasExpandButton ? TITLE_EXPAND_BUTTON_GROWTH : 0);
      },
    });
    const resizeCallbacks: ResizeObserverCallback[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          resizeCallbacks.push(callback);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );

    render(
      <LockerDetailBottomSheet locker={LOCKER_DETAIL} onReport={vi.fn()} />,
    );
    const fullSnapTarget =
      draggableBottomSheetMock.mock.lastCall?.[0].minSnapPoint;

    // 스프링이 타깃을 잡는다. 이때 콘텐츠에는 아직 펼치기 버튼이 없다.
    act(() => {
      draggableBottomSheetMock.mock.lastCall?.[0].onSnapChange?.(
        fullSnapTarget,
      );
    });
    await screen.findByRole("button", {
      name: m.locker_detail_title_expand_aria(),
    });
    // 버튼이 붙어 콘텐츠가 커졌고, 브라우저라면 ResizeObserver 가 다시 재는 시점이다.
    act(() => {
      for (const callback of resizeCallbacks) {
        callback([], {} as ResizeObserver);
      }
    });
    act(() => {
      draggableBottomSheetMock.mock.lastCall?.[0].onLiveOffsetChange?.({
        offset: fullSnapTarget,
        expandedProgress: 1,
        snapPoints: [],
      });
    });

    // minSnapPoint 는 타깃보다 내려갔지만, 시트는 타깃에 안착해 있다.
    expect(
      draggableBottomSheetMock.mock.lastCall?.[0].minSnapPoint,
    ).toBeLessThan(fullSnapTarget);
    expect(
      getSheetRoot().getByRole("region", { name: "실시간 이용 가능" }),
    ).toBeTruthy();
  });

  it("카드가 빠진 단계에서도 full 스냅 위치는 카드를 포함한 높이로 유지한다", () => {
    const FULL_CONTENT_HEIGHT = 400;
    const REALTIME_CARD_BLOCK_HEIGHT = 58 + 8;
    // 카드를 빼면 콘텐츠가 그만큼 줄어드는 실제 상황을 흉내 낸다.
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get(this: HTMLElement) {
        return this.querySelector("[data-realtime-status-card]") === null
          ? FULL_CONTENT_HEIGHT - REALTIME_CARD_BLOCK_HEIGHT
          : FULL_CONTENT_HEIGHT;
      },
    });

    const { rerender } = render(
      <LockerDetailBottomSheet locker={LOCKER_DETAIL} onReport={vi.fn()} />,
    );
    const halfMinSnapPoint =
      draggableBottomSheetMock.mock.lastCall?.[0].minSnapPoint;

    // 하프에서는 카드가 DOM 에서 빠져야 빈 자리가 보이지 않는다.
    expect(
      getSheetRoot().queryByRole("region", { name: "실시간 이용 가능" }),
    ).toBeNull();
    expect(halfMinSnapPoint).toBe(812 - (FULL_CONTENT_HEIGHT + 8 + 24));

    rerender(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        initialSnapPoint={LOCKER_DETAIL_FULL_TOP_OFFSET}
        onReport={vi.fn()}
      />,
    );

    expect(
      getSheetRoot().getByRole("region", { name: "실시간 이용 가능" }),
    ).toBeTruthy();
    expect(draggableBottomSheetMock.mock.lastCall?.[0].minSnapPoint).toBe(
      halfMinSnapPoint,
    );
  });

  it("다른 보관함을 열면 초기 스냅이 같아도 라이브 상태를 초기화한다", async () => {
    const { rerender } = render(
      <LockerDetailBottomSheet locker={LOCKER_DETAIL} onReport={vi.fn()} />,
    );
    const getOverlayBottom = () => {
      const sheet = screen.getByTestId("mock-draggable-bottom-sheet");

      return (
        screen
          .getAllByRole("region", { name: "실시간 이용 가능" })
          .find((card) => !sheet.contains(card))?.parentElement?.style.bottom ??
        null
      );
    };

    // 하프로 연 뒤 미니로 내려둔다.
    act(() => {
      draggableBottomSheetMock.mock.lastCall?.[0].onSnapChange?.(701);
    });
    act(() => {
      draggableBottomSheetMock.mock.lastCall?.[0].onLiveOffsetChange?.({
        offset: 701,
        expandedProgress: 0,
        snapPoints: [],
      });
    });
    await waitFor(() => {
      expect(getOverlayBottom()).toBe(overlayBottomAt(701));
    });

    // 다른 보관함. initialSnapPoint 는 그대로라 안쪽 시트만 하프로 리마운트된다.
    rerender(
      <LockerDetailBottomSheet
        locker={{ ...LOCKER_DETAIL, lockerId: 22 }}
        onReport={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(getOverlayBottom()).toBe(overlayBottomAt(621));
    });
  });

  it("미니 시트에서도 실시간 카드를 시트 바깥에 렌더링한다", () => {
    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        initialSnapPoint={701}
        onReport={vi.fn()}
      />,
    );

    const realtimeStatusCard = screen.getByRole("region", {
      name: "실시간 이용 가능",
    });

    expect(realtimeStatusCard.parentElement?.style.bottom).toBe(
      overlayBottomAt(701),
    );
    expect(
      getSheetRoot().queryByRole("region", { name: "실시간 이용 가능" }),
    ).toBeNull();
  });

  it("실시간 정보가 없으면 시트 바깥 카드를 표시하지 않는다", () => {
    render(
      <LockerDetailBottomSheet
        locker={{ ...LOCKER_DETAIL, realtimeAvailability: null }}
        onReport={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("region", { name: "실시간 이용 가능" }),
    ).toBeNull();
    expect(screen.queryByText("실시간 이용 정보 미제공")).toBeNull();
  });

  it("풀 시트에서도 실시간 정보가 없으면 카드를 표시하지 않는다", () => {
    render(
      <LockerDetailBottomSheet
        locker={{
          ...LOCKER_DETAIL,
          realtimeAvailability: {
            isAvailable: false,
            smallAvailableCount: 12,
            mediumAvailableCount: 2,
            largeAvailableCount: 0,
            fetchedAt: "2026-08-14T14:19:47.013473",
          },
        }}
        initialSnapPoint={LOCKER_DETAIL_FULL_TOP_OFFSET}
        onReport={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("region", { name: "실시간 이용 가능" }),
    ).toBeNull();
    expect(screen.queryByText("실시간 이용 정보 미제공")).toBeNull();
    expect(screen.queryByText("S - · M - · L -")).toBeNull();
  });

  it("상세 로드 실패 시 오류 피드백과 재시도를 표시한다", () => {
    const handleRetry = vi.fn();

    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        loadState="error"
        onRetry={handleRetry}
        onReport={vi.fn()}
      />,
    );
    const sheet = getSheetRoot();

    expect(sheet.getByRole("alert")).toBeTruthy();
    fireEvent.click(sheet.getByRole("button", { name: "다시 시도" }));
    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it("공유와 길찾기 동작을 분리한다", () => {
    const handleShare = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        onShare={handleShare}
        onNavigate={handleNavigate}
        onReport={vi.fn()}
      />,
    );
    const sheet = getSheetRoot();

    fireEvent.click(sheet.getByRole("button", { name: "더보기 메뉴 열기" }));
    fireEvent.click(screen.getByRole("button", { name: "공유하기" }));
    fireEvent.click(sheet.getByRole("button", { name: "길찾기" }));

    expect(handleShare).toHaveBeenCalledWith(LOCKER_DETAIL);
    expect(handleNavigate).toHaveBeenCalledWith(LOCKER_DETAIL);
  });

  it("즐겨찾기 handler가 없으면 더보기 메뉴에서 즐겨찾기를 숨긴다", () => {
    const handleReport = vi.fn();
    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        onReport={handleReport}
      />,
    );
    const sheet = getSheetRoot();

    fireEvent.click(sheet.getByRole("button", { name: "더보기 메뉴 열기" }));
    expect(screen.queryByRole("button", { name: "즐겨찾기 추가" })).toBeNull();
    expect(screen.getByRole("button", { name: "신고하기" })).toBeTruthy();
  });

  it("더보기 메뉴에서 즐겨찾기와 수정 요청 흐름을 실행한다", () => {
    const handleFavoriteChange = vi.fn();
    const handleReport = vi.fn();
    const handleCorrectionSubmit = vi.fn();

    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        onFavoriteChange={handleFavoriteChange}
        onReport={handleReport}
        onCorrectionSubmit={handleCorrectionSubmit}
      />,
    );
    const sheet = getSheetRoot();
    const openMoreActions = () =>
      fireEvent.click(sheet.getByRole("button", { name: "더보기 메뉴 열기" }));

    openMoreActions();
    fireEvent.click(screen.getByRole("button", { name: "즐겨찾기 추가" }));
    expect(handleFavoriteChange).toHaveBeenCalledWith(LOCKER_DETAIL, true);
    expect(screen.queryByRole("dialog")).toBeNull();

    openMoreActions();
    fireEvent.click(screen.getByRole("button", { name: "신고하기" }));
    expect(handleReport).toHaveBeenCalledWith(LOCKER_DETAIL);
    expect(
      screen.queryByRole("dialog", { name: "보관함 더보기 메뉴" }),
    ).toBeNull();
    expect(screen.getByRole("dialog", { name: "신고하기" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /신고 유형 선택/ }));
    fireEvent.click(
      screen.getByRole("option", { name: "위치가 잘못되었어요" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(
      screen.getByRole("dialog", { name: "정말 제출하시겠어요?" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "아니오" }));
    expect(screen.getByRole("dialog", { name: "신고하기" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    fireEvent.click(screen.getByRole("button", { name: "예" }));

    expect(handleCorrectionSubmit).toHaveBeenCalledWith(LOCKER_DETAIL, {
      reason: "WRONG_LOCATION",
      details: null,
    });
    expect(screen.queryByRole("dialog", { name: "신고하기" })).toBeNull();
    const successDialog = screen.getByRole("dialog", { name: "신고 접수됨" });
    expect(successDialog.textContent).toContain("불편을 드려 죄송합니다");
    expect(successDialog.textContent).toContain(
      "빠른 시일 내에 조치하겠습니다",
    );

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.queryByRole("dialog", { name: "신고 접수됨" })).toBeNull();
  });

  it("deprecated 정확성 투표 액션을 노출하지 않는다", () => {
    render(
      <LockerDetailBottomSheet locker={LOCKER_DETAIL} onReport={vi.fn()} />,
    );
    const sheet = getSheetRoot();

    expect(sheet.queryByRole("button", { name: /정확한 정보에요/ })).toBeNull();
    expect(
      sheet.queryByRole("button", { name: /부정확한 정보에요/ }),
    ).toBeNull();
  });

  it("닫힘 단계의 뒤로가기는 에러 화면에서 유지한다", () => {
    const handleBack = vi.fn();

    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        loadState="error"
        onBack={handleBack}
        onReport={vi.fn()}
      />,
    );
    const sheet = getSheetRoot();

    fireEvent.click(sheet.getByRole("button", { name: "뒤로가기" }));

    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("renders a loading skeleton while locker detail is loading", () => {
    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        loadState="loading"
        onReport={vi.fn()}
      />,
    );
    const sheet = getSheetRoot();

    expect(
      sheet.getByRole("status", { name: m.search_result_loading_aria() }),
    ).toBeTruthy();
    expect(sheet.queryByText(LOCKER_DETAIL.title)).toBeNull();
  });

  it("거리 정보가 비어 있어도 미제공 문구를 노출한다", () => {
    setTestLanguage("en");

    render(
      <LockerDetailBottomSheet
        locker={{ ...LOCKER_DETAIL, distanceLabel: "" }}
        onReport={vi.fn()}
      />,
    );
    const sheet = getSheetRoot();

    expect(sheet.getByText("Distance unavailable")).toBeTruthy();
  });

  it("이름 펼치기 버튼은 풀 바텀시트에서만 노출한다", async () => {
    const { rerender } = render(
      <LockerDetailBottomSheet locker={LOCKER_DETAIL} onReport={vi.fn()} />,
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: m.locker_detail_title_expand_aria(),
        }),
      ).toBeNull();
    });

    rerender(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        initialSnapPoint={112}
        onReport={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole("button", {
        name: m.locker_detail_title_expand_aria(),
      }),
    ).toBeTruthy();
  });

  it("이미지가 있으면 상세 이미지를 렌더링한다", () => {
    render(
      <LockerDetailBottomSheet
        locker={{
          ...LOCKER_DETAIL,
          images: ["https://example.com/locker.jpg"],
        }}
        onReport={vi.fn()}
      />,
    );
    const sheet = getSheetRoot();
    const imageButton = sheet.getByRole("button", {
      name: "보관함 사진 1 / 1",
    });

    expect(imageButton.querySelector("img")?.getAttribute("src")).toBe(
      "https://example.com/locker.jpg",
    );
  });

  it("이미지가 없으면 이미지 영역을 아예 렌더링하지 않는다", () => {
    render(
      <LockerDetailBottomSheet
        locker={{ ...LOCKER_DETAIL, images: [] }}
        onReport={vi.fn()}
      />,
    );
    const sheet = getSheetRoot();

    expect(
      sheet.queryByRole("list", { name: m.locker_detail_image_list_aria() }),
    ).toBeNull();
  });

  it("상세 이미지를 누르면 원본 미리보기를 연다", () => {
    render(
      <LockerDetailBottomSheet
        locker={{
          ...LOCKER_DETAIL,
          images: ["https://example.com/locker.jpg"],
        }}
        onReport={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "보관함 사진 1 / 1" }));

    const dialog = screen.getByRole("dialog", {
      name: m.report_section_photo(),
    });
    expect(within(dialog).getByRole("img").getAttribute("src")).toBe(
      "https://example.com/locker.jpg",
    );

    fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));

    expect(
      screen.queryByRole("dialog", { name: m.report_section_photo() }),
    ).toBeNull();
  });

  it("converts stage snap requests to detail snap points", () => {
    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        snapRequest={{ id: 1, stage: "mini" }}
        onReport={vi.fn()}
      />,
    );

    const latestSheetProps = draggableBottomSheetMock.mock.calls.at(-1)?.[0];

    expect(latestSheetProps?.snapRequest).toEqual({
      id: 1,
      snapPoint: latestSheetProps?.miniSnapPoint,
    });
  });

  it("forwards snap changes as detail snap stages", () => {
    const handleSnapStageChange = vi.fn();

    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        snapRequest={{ id: 1, stage: "full" }}
        onSnapStageChange={handleSnapStageChange}
        onReport={vi.fn()}
      />,
    );

    const latestSheetProps = draggableBottomSheetMock.mock.calls.at(-1)?.[0];
    latestSheetProps?.onSnapChange?.(latestSheetProps?.minSnapPoint ?? 112);

    // 두 번째 인자는 그 단계에서 시트가 실제로 차지하는 높이다. full 은 콘텐츠
    // 높이에 따라 달라져 상수로 단정할 수 없다.
    expect(handleSnapStageChange).toHaveBeenCalledWith(
      "full",
      expect.any(Number),
    );
    expect(latestSheetProps?.snapRequest).toEqual({
      id: 1,
      snapPoint: latestSheetProps?.minSnapPoint,
    });
  });

  it("enables internal content scroll only when the detail sheet opens full", () => {
    const { rerender } = render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        snapPoint={566}
        onReport={vi.fn()}
      />,
    );

    expect(
      document
        .querySelector("[data-scroll-enabled]")
        ?.getAttribute("data-scroll-enabled"),
    ).toBe("false");

    rerender(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        initialSnapPoint={112}
        onReport={vi.fn()}
      />,
    );

    expect(
      document
        .querySelector("[data-scroll-enabled]")
        ?.getAttribute("data-scroll-enabled"),
    ).toBe("true");
  });
});
