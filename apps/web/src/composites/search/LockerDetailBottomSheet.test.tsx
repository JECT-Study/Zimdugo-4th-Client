// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LockerDetailItem } from "./LockerDetailBottomSheet";
import { LockerDetailBottomSheet } from "./LockerDetailBottomSheet";

const LOCKER_DETAIL: LockerDetailItem = {
  suggestType: "LOCKER",
  id: "sinchon-locker",
  title: "신촌역 5번 출구 B2층 물품보관함",
  categoryLabel: "지하철역",
  updatedLabel: "4시간 전 업데이트",
  distanceLabel: "210m",
  address: "서울 서대문구 신촌로 83",
  floorLabel: "B2층",
  priceLabel: "000원 ~ 000원",
  sizeLabel: "S / M / L / 기타",
  accurateCount: 78,
  inaccurateCount: 5,
  lastUpdatedLabel: "최근 업데이트 2026-05-16 16:25",
};

describe("LockerDetailBottomSheet", () => {
  it("renders the half detail summary and actions", () => {
    render(<LockerDetailBottomSheet locker={LOCKER_DETAIL} />);

    expect(screen.getByText(LOCKER_DETAIL.title)).toBeTruthy();
    expect(screen.getByText("아직 이미지가 없어요.")).toBeTruthy();
    expect(screen.getByText("제보하기를 통해 등록할 수 있어요!")).toBeTruthy();
    expect(screen.getByRole("button", { name: "공유하기" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "길찾기" })).toBeTruthy();
  });

  it("separates favorite, share, and navigate actions", () => {
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

  it("renders the full detail content when the sheet starts at the full snap point", () => {
    render(
      <LockerDetailBottomSheet
        locker={LOCKER_DETAIL}
        minSnapPoint={44}
        snapPoint={44}
      />,
    );

    expect(screen.getByText("가격")).toBeTruthy();
    expect(screen.getByText("사이즈")).toBeTruthy();
    expect(screen.getByText("보관함 상세 정보")).toBeTruthy();
    expect(screen.getByText("정확한 정보에요 78")).toBeTruthy();
    expect(screen.getByText("부정확한 정보에요 5")).toBeTruthy();
    expect(screen.getByText("최근 업데이트 2026-05-16 16:25")).toBeTruthy();
  });
});
