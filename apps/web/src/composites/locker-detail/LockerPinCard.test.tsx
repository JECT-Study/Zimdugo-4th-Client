// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import { setTestLanguage } from "#/shared/test/language-runtime";
import { LockerPinCard } from "./LockerPinCard";

const LOCKER: LockerDetailItem = {
  itemType: "LOCKER",
  lockerId: 11,
  title: "신촌역 5번 출구 물품보관함",
  categoryLabel: "지하철역",
  updatedLabel: "4시간 전 업데이트",
  distanceLabel: "210m",
  address: "서울 서대문구 신촌로 83",
  operatingHoursLabel: "05:30 ~ 24:00",
  isFavorite: false,
};

beforeEach(() => {
  setTestLanguage("ko");
});

afterEach(cleanup);

describe("LockerPinCard", () => {
  it("이름·거리·운영시간을 보여 주고 자세히 보기로 상세를 연다", () => {
    const onOpenDetail = vi.fn();
    render(<LockerPinCard locker={LOCKER} onOpenDetail={onOpenDetail} />);

    expect(
      screen.getByRole("heading", { name: "신촌역 5번 출구 물품보관함" }),
    ).toBeTruthy();
    expect(screen.getByText("210m")).toBeTruthy();
    expect(screen.getByText("05:30 ~ 24:00")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "자세히 보기" }));
    expect(onOpenDetail).toHaveBeenCalledTimes(1);
  });

  it("길찾기는 카드의 보관함을 넘긴다", () => {
    const onNavigate = vi.fn();
    render(
      <LockerPinCard
        locker={LOCKER}
        onNavigate={onNavigate}
        onOpenDetail={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "길찾기" }));
    expect(onNavigate).toHaveBeenCalledWith(LOCKER);
  });

  it("즐겨찾기를 쓸 수 있을 때만 별 버튼을 두고 누르면 뒤집는다", () => {
    const onFavoriteChange = vi.fn();
    const { rerender } = render(
      <LockerPinCard locker={LOCKER} onOpenDetail={vi.fn()} />,
    );
    expect(screen.queryByRole("button", { name: "즐겨찾기 추가" })).toBeNull();

    rerender(
      <LockerPinCard
        locker={LOCKER}
        canFavorite
        onFavoriteChange={onFavoriteChange}
        onOpenDetail={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "즐겨찾기 추가" }));
    expect(onFavoriteChange).toHaveBeenCalledWith(LOCKER, true);
  });

  it("상세를 받는 동안에는 이름 대신 자리표시를 두고 자세히 보기는 남긴다", () => {
    render(<LockerPinCard locker={LOCKER} isLoading onOpenDetail={vi.fn()} />);

    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByRole("button", { name: "자세히 보기" })).toBeTruthy();
  });

  it("실시간 정보가 있으면 맨 위에 이용 가능 여부만 알리고 크기별 개수는 두지 않는다", () => {
    render(
      <LockerPinCard
        locker={{
          ...LOCKER,
          realtimeAvailability: {
            isAvailable: true,
            smallAvailableCount: 12,
            mediumAvailableCount: 2,
            largeAvailableCount: 0,
            fetchedAt: "2026-11-28T10:00:00",
          },
        }}
        onOpenDetail={vi.fn()}
      />,
    );

    expect(screen.getByText("실시간 이용 가능")).toBeTruthy();
    expect(screen.queryByText("12")).toBeNull();
  });
});
