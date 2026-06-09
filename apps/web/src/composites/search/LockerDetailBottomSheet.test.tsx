// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { fireEvent, render, screen, within, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#/shared/ui/DraggableBottomSheet", () => ({
  DraggableBottomSheet: ({ children }: { children: ReactNode }) => (
    <div data-testid="mock-draggable-bottom-sheet">{children}</div>
  ),
}));

import type { LockerDetailItem } from "./LockerDetailBottomSheet";
import { LockerDetailBottomSheet } from "./LockerDetailBottomSheet";

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

const getSheetRoot = () =>
  within(screen.getByTestId("mock-draggable-bottom-sheet"));

describe("LockerDetailBottomSheet", () => {
  beforeEach(() => {
    setLanguageTag("ko");
  });

  afterEach(() => {
    cleanup();
  });

  it("하프 시트 요약과 액션 버튼을 렌더링한다", () => {
    render(<LockerDetailBottomSheet locker={LOCKER_DETAIL} />);
    const sheet = getSheetRoot();

    expect(sheet.getByText(LOCKER_DETAIL.title)).toBeTruthy();
    expect(sheet.getByText("아직 이미지가 없어요.")).toBeTruthy();
    expect(sheet.getByText("제보하기를 통해 등록할 수 있어요!")).toBeTruthy();
    expect(sheet.getByRole("button", { name: "공유하기" })).toBeTruthy();
    expect(sheet.getByRole("button", { name: "길찾기" })).toBeTruthy();
  });

  it("상세 로드 실패 시 오류 피드백과 재시도를 표시한다", () => {
    const handleRetry = vi.fn();

    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        loadState="error"
        onRetry={handleRetry}
      />,
    );
    const sheet = getSheetRoot();

    expect(sheet.getByRole("alert")).toBeTruthy();
    fireEvent.click(sheet.getByRole("button", { name: "다시 시도" }));
    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it("즐겨찾기·공유·길찾기 동작을 분리한다", () => {
    const handleFavoriteChange = vi.fn();
    const handleShare = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        onFavoriteChange={handleFavoriteChange}
        onShare={handleShare}
        onNavigate={handleNavigate}
      />,
    );
    const sheet = getSheetRoot();

    fireEvent.click(sheet.getByRole("button", { name: "즐겨찾기 추가" }));
    fireEvent.click(sheet.getByRole("button", { name: "공유하기" }));
    fireEvent.click(sheet.getByRole("button", { name: "길찾기" }));

    expect(handleFavoriteChange).toHaveBeenCalledWith(LOCKER_DETAIL, true);
    expect(handleShare).toHaveBeenCalledWith(LOCKER_DETAIL);
    expect(handleNavigate).toHaveBeenCalledWith(LOCKER_DETAIL);
  });

  it("풀 스냅 시 전체 상세 콘텐츠를 렌더링한다", () => {
    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        minSnapPoint={44}
        snapPoint={44}
      />,
    );
    const sheet = getSheetRoot();

    expect(sheet.queryByRole("button", { name: "뒤로가기" })).toBeNull();
    expect(sheet.getByText("가격")).toBeTruthy();
    expect(sheet.getByText("사이즈")).toBeTruthy();
    expect(sheet.getByText("보관함 상세 정보")).toBeTruthy();
    expect(sheet.getByText("정확한 정보에요 78")).toBeTruthy();
    expect(sheet.getByText("부정확한 정보에요 5")).toBeTruthy();
    expect(sheet.getByText("최근 업데이트 2026-05-16 16:25")).toBeTruthy();
  });

  it("뒤로가기 버튼을 누르면 onBack을 호출한다", () => {
    const handleBack = vi.fn();

    render(
      <LockerDetailBottomSheet locker={LOCKER_DETAIL} onBack={handleBack} />,
    );
    const sheet = getSheetRoot();

    fireEvent.click(sheet.getByRole("button", { name: "뒤로가기" }));

    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
