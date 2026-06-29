// @vitest-environment jsdom

import { m, setLanguageTag } from "@repo/i18n";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
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
  reportStatus: "SUBMITTED",
};

describe("ReportDetailViewerModal", () => {
  beforeEach(() => {
    cleanup();
    setLanguageTag("ko", { reload: false });
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

    expect(screen.getByText(m.my_report_detail_eyebrow())).toBeTruthy();
    expect(screen.getByText(REPORT_DETAIL.lockerName)).toBeTruthy();
    expect(screen.getByText(m.my_report_detail_close())).toBeTruthy();
    expect(screen.getByText(m.my_report_detail_location_group())).toBeTruthy();
    expect(screen.getByText(m.my_report_detail_locker_group())).toBeTruthy();
    expect(
      screen.getAllByText(m.report_section_additional()).length,
    ).toBeGreaterThan(0);
    expect(
      document.querySelector('[data-slot="information-title"]'),
    ).toBeTruthy();
    expect(document.querySelector('[data-slot="legacy-header"]')).toBeNull();
    expect(screen.getByText(m.report_status_pending())).toBeTruthy();
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

    expect(screen.getByText(m.my_report_image_empty())).toBeTruthy();
    expect(screen.queryByText("사진을 등록해주세요")).toBeNull();
    expect(screen.queryByText("보관함 사진을 추가하면")).toBeNull();
  });
  it("reportStatus가 없으면 상태 배지를 표시하지 않는다", () => {
    render(
      <ReportDetailViewerModal
        isOpen
        onOpenChange={vi.fn()}
        titleText={REPORT_DETAIL.lockerName}
        detail={{ ...REPORT_DETAIL, reportStatus: null }}
        loadState="ready"
      />,
    );

    expect(screen.queryByText(m.report_status_pending())).toBeNull();
    expect(screen.queryByText(m.report_status_approved())).toBeNull();
    expect(screen.queryByText(m.report_status_rejected())).toBeNull();
  });

  it("로딩 중에는 이전 상세 데이터의 상태 배지를 표시하지 않는다", () => {
    render(
      <ReportDetailViewerModal
        isOpen
        onOpenChange={vi.fn()}
        titleText={REPORT_DETAIL.lockerName}
        detail={REPORT_DETAIL}
        loadState="loading"
      />,
    );

    expect(screen.queryByText(m.report_status_pending())).toBeNull();
  });
  it("이미지를 누르면 원본 미리보기를 열고 닫을 수 있다", () => {
    render(
      <ReportDetailViewerModal
        isOpen
        onOpenChange={vi.fn()}
        titleText={REPORT_DETAIL.lockerName}
        detail={{
          ...REPORT_DETAIL,
          imageUrl: "https://example.com/report.jpg",
        }}
        loadState="ready"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: m.report_section_photo() }),
    );

    const dialog = screen.getByRole("dialog", {
      name: m.report_section_photo(),
    });
    expect(within(dialog).getByRole("img").getAttribute("src")).toBe(
      "https://example.com/report.jpg",
    );

    fireEvent.click(
      within(dialog).getByRole("button", { name: m.my_report_detail_close() }),
    );

    expect(
      screen.queryByRole("dialog", { name: m.report_section_photo() }),
    ).toBeNull();
  });

  it("프리뷰가 열려 있을 때 Escape를 누르면 프리뷰만 닫는다", () => {
    render(
      <ReportDetailViewerModal
        isOpen
        onOpenChange={vi.fn()}
        titleText={REPORT_DETAIL.lockerName}
        detail={{
          ...REPORT_DETAIL,
          imageUrl: "https://example.com/report.jpg",
        }}
        loadState="ready"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: m.report_section_photo() }),
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(
      screen.queryByRole("dialog", { name: m.report_section_photo() }),
    ).toBeNull();
    expect(
      screen.getByRole("dialog", {
        name: m.my_report_detail_viewer_aria(),
      }),
    ).toBeTruthy();
  });
});
