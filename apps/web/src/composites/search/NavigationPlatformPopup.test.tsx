// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LockerDetailItem } from "./LockerDetailBottomSheet";
import {
  getNavigationPlatformUrl,
  NavigationPlatformPopup,
} from "./NavigationPlatformPopup";

const LOCKER_DETAIL: LockerDetailItem = {
  suggestType: "LOCKER",
  id: "sinchon-locker",
  title: "신촌역 5번 출구 B2층 물품보관함",
  categoryLabel: "지하철역",
  updatedLabel: "4시간 전 업데이트",
  distanceLabel: "210m",
  address: "서울 서대문구 신촌로 83",
};

describe("NavigationPlatformPopup", () => {
  it("renders two navigation platform choices", () => {
    render(
      <NavigationPlatformPopup
        isOpen
        locker={LOCKER_DETAIL}
        onOpenChange={() => undefined}
      />,
    );

    expect(screen.getByText("어떤 지도로 길찾기 할까요?")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "네이버맵으로 길찾기" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "구글맵스로 길찾기" }),
    ).toBeTruthy();
  });

  it("builds platform search urls from the selected locker", () => {
    expect(getNavigationPlatformUrl("naver", LOCKER_DETAIL)).toContain(
      "map.naver.com",
    );
    expect(getNavigationPlatformUrl("google", LOCKER_DETAIL)).toContain(
      "google.com/maps/search",
    );
    expect(
      decodeURIComponent(getNavigationPlatformUrl("google", LOCKER_DETAIL)),
    ).toContain(LOCKER_DETAIL.address);
  });
});
