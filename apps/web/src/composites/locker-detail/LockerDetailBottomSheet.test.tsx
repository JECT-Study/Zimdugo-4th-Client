// @vitest-environment jsdom

import { m, setLanguageTag } from "@repo/i18n";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const draggableBottomSheetMock = vi.hoisted(() => vi.fn());

vi.mock("#/shared/ui/DraggableBottomSheet", () => ({
  DraggableBottomSheet: (props: {
    animateOnMount?: boolean;
    children: ReactNode;
    initialSnapPoint?: number;
    maxSnapPoint?: number;
    miniSnapPoint?: number;
    minSnapPoint?: number;
    onSnapChange?: (nextSnap: number) => void;
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

describe("LockerDetailBottomSheet", () => {
  beforeEach(() => {
    setLanguageTag("ko");
    Object.defineProperty(globalThis, "CSS", {
      configurable: true,
      value: {
        escape: (value: string) => value,
      },
    });
  });

  afterEach(() => {
    cleanup();
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

  it("기본 진입부터 풀 상세 콘텐츠를 렌더링한다", () => {
    render(
      <LockerDetailBottomSheet locker={LOCKER_DETAIL} onReport={vi.fn()} />,
    );
    const sheet = getSheetRoot();

    expect(sheet.getByText("아직 이미지가 없어요.")).toBeTruthy();
    expect(sheet.getByText("제보하기를 통해 등록할 수 있어요!")).toBeTruthy();
    expect(sheet.queryByText("최근 업데이트 2026-05-16 16:25")).toBeNull();
    expect(sheet.getByText(LOCKER_DETAIL.title)).toBeTruthy();
    expect(sheet.getAllByText("가격").length).toBeGreaterThan(0);
    expect(sheet.getByText("사이즈")).toBeTruthy();
    expect(sheet.getByText("보관함 상세 정보")).toBeTruthy();
    expect(sheet.getByText("실시간 보관함 잔여석")).toBeTruthy();
    expect(sheet.getByText("S 12 · M 2 · L 0")).toBeTruthy();
    const realtimeAvailabilityCard = sheet
      .getByText("실시간 보관함 잔여석")
      .closest("section");
    const realtimeAvailabilityDivider = sheet.getByRole("separator");
    expect(realtimeAvailabilityCard?.nextElementSibling).toBe(
      realtimeAvailabilityDivider,
    );
    expect(
      sheet.getByRole("button", { name: "더보기 메뉴 열기" }),
    ).toBeTruthy();
    expect(sheet.getByRole("button", { name: "길찾기" })).toBeTruthy();
  });

  it("실시간 정보가 없으면 사이즈별 잔여석을 대시로 표시한다", () => {
    render(
      <LockerDetailBottomSheet
        locker={{ ...LOCKER_DETAIL, realtimeAvailability: null }}
        onReport={vi.fn()}
      />,
    );
    const sheet = getSheetRoot();

    expect(sheet.getByText("실시간 이용 정보 미제공")).toBeTruthy();
    expect(sheet.getByText("S - · M - · L -")).toBeTruthy();
  });

  it("실시간 이용 불가 상태이면 사이즈별 잔여석을 대시로 표시한다", () => {
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
        onReport={vi.fn()}
      />,
    );
    const sheet = getSheetRoot();

    expect(sheet.getByText("실시간 이용 정보 미제공")).toBeTruthy();
    expect(sheet.getByText("S - · M - · L -")).toBeTruthy();
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
    setLanguageTag("en");

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

  it("renders detail image when imageUrl exists", () => {
    render(
      <LockerDetailBottomSheet
        locker={{
          ...LOCKER_DETAIL,
          imageUrl: "https://example.com/locker.jpg",
        }}
        onReport={vi.fn()}
      />,
    );
    const sheet = getSheetRoot();
    const image = sheet.getByRole("img");

    expect(image.getAttribute("src")).toBe("https://example.com/locker.jpg");
    expect(sheet.queryByText("아직 이미지가 없어요.")).toBeNull();
  });

  it("opens original image preview when detail image is clicked", () => {
    render(
      <LockerDetailBottomSheet
        locker={{
          ...LOCKER_DETAIL,
          imageUrl: "https://example.com/locker.jpg",
        }}
        onReport={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: m.report_section_photo() }),
    );

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

    expect(handleSnapStageChange).toHaveBeenCalledWith("full");
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
