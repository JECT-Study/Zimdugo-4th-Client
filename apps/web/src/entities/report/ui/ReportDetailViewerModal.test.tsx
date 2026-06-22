// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MyLockerReportDetail } from "#/shared/api/my-page";
import { ReportDetailViewerModal } from "./ReportDetailViewerModal";

const REPORT_DETAIL: MyLockerReportDetail = {
  reportId: 1,
  lockerName: "신촌역 5번 출구 B2 보관함",
  roadAddress: "서울 서대문구 신촌로 83",
  latitude: 37.555,
  longitude: 126.936,
  hasFloor: true,
  floorType: "UNDERGROUND",
  floorNumber: 2,
  indoorOutdoorType: "INDOOR",
  lockerType: "UNMANNED",
  sizeTypes: ["SMALL", "MEDIUM", "LARGE"],
  priceType: "PAID",
  minPrice: 2000,
  maxPrice: 5000,
  operatingTimeType: "TIME_RANGE",
  startTime: "06:00",
  endTime: "23:30",
  additionalInfo: "5번 출구 안쪽에 있습니다.",
  imageUrl: null,
  locationConsentAgreed: true,
};

describe("ReportDetailViewerModal", () => {
  beforeEach(() => {
    cleanup();
    setLanguageTag("ko");
  });

  it("기본 디자인은 Header와 상단 X 없이 정렬된 상세 정보를 표시한다", () => {
    render(
      <ReportDetailViewerModal
        isOpen
        onOpenChange={vi.fn()}
        titleText={REPORT_DETAIL.lockerName}
        detail={REPORT_DETAIL}
        loadState="ready"
      />,
    );

    expect(screen.getByText("제보한 보관함")).toBeTruthy();
    expect(screen.getByText(REPORT_DETAIL.lockerName)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "닫기" })).toHaveLength(1);
    expect(screen.getByText("위치 정보")).toBeTruthy();
    expect(screen.getByText("보관함 정보")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "추가 정보" })).toBeTruthy();
    expect(
      document.querySelector('[data-slot="information-title"]'),
    ).toBeTruthy();
    expect(document.querySelector('[data-slot="legacy-header"]')).toBeNull();
  });

  it("이미지가 없으면 history 전용 문구만 표시한다", () => {
    render(
      <ReportDetailViewerModal
        isOpen
        onOpenChange={vi.fn()}
        titleText={REPORT_DETAIL.lockerName}
        detail={REPORT_DETAIL}
        loadState="ready"
      />,
    );

    expect(screen.getByText("이미지 없음")).toBeTruthy();
    expect(screen.queryByText("아직 이미지가 없어요.")).toBeNull();
    expect(screen.queryByText("제보하기를 통해 등록할 수 있어요!")).toBeNull();
  });
});
