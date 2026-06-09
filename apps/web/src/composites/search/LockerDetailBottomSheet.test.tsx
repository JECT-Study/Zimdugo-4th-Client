// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

describe("LockerDetailBottomSheet", () => {
  it("하프 시트 요약과 액션 버튼을 렌더링한다", () => {
    render(<LockerDetailBottomSheet locker={LOCKER_DETAIL} />);

    expect(screen.getByText(LOCKER_DETAIL.title)).toBeTruthy();
    expect(screen.getByText("아직 이미지가 없어요.")).toBeTruthy();
    expect(screen.getByText("제보하기를 통해 등록할 수 있어요!")).toBeTruthy();
    expect(screen.getByRole("button", { name: "공유하기" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "길찾기" })).toBeTruthy();
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

    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
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

    fireEvent.click(screen.getByRole("button", { name: "즐겨찾기 추가" }));
    fireEvent.click(screen.getByRole("button", { name: "공유하기" }));
    fireEvent.click(screen.getByRole("button", { name: "길찾기" }));

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

    expect(screen.queryByRole("button", { name: "뒤로가기" })).toBeNull();
    expect(screen.getByText("가격")).toBeTruthy();
    expect(screen.getByText("사이즈")).toBeTruthy();
    expect(screen.getByText("보관함 상세 정보")).toBeTruthy();
    expect(screen.getByText("정확한 정보에요 78")).toBeTruthy();
    expect(screen.getByText("부정확한 정보에요 5")).toBeTruthy();
    expect(screen.getByText("최근 업데이트 2026-05-16 16:25")).toBeTruthy();
  });

  it("뒤로가기 버튼을 누르면 onBack을 호출한다", () => {
    const handleBack = vi.fn();

    render(
      <LockerDetailBottomSheet locker={LOCKER_DETAIL} onBack={handleBack} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
