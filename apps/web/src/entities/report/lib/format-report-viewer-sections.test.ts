import { setLanguageTag } from "@repo/i18n";
import { beforeEach, describe, expect, it } from "vitest";
import type { MyLockerReportDetail } from "#/shared/api/my-page";
import { formatReportViewerInformationGroups } from "./format-report-viewer-sections";

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
  isFree: false,
  minPrice: 2000,
  maxPrice: 5000,
  startTime: "06:00",
  endTime: "23:30",
  additionalInfo: "5번 출구 안쪽에 있습니다.",
  imageUrl: null,
  locationConsentAgreed: true,
};

describe("formatReportViewerInformationGroups", () => {
  beforeEach(() => {
    setLanguageTag("ko");
  });

  it("상세 정보를 위치, 보관함, 추가 정보 순서로 그룹화한다", () => {
    const groups = formatReportViewerInformationGroups(REPORT_DETAIL);

    expect(groups.map((group) => group.title)).toEqual([
      "위치 정보",
      "보관함 정보",
      "추가 정보",
    ]);
    expect(groups[0]?.fields.map((field) => field.label)).toEqual([
      "주소",
      "상세 위치",
      "실내/실외",
    ]);
    expect(groups[1]?.fields.map((field) => field.label)).toEqual([
      "유형",
      "규격",
      "가격",
      "이용 시간",
    ]);
    expect(groups[2]?.fields[0]?.value).toBe("5번 출구 안쪽에 있습니다.");
    expect(
      groups[1]?.fields.find((field) => field.label === "이용 시간")?.value,
    ).toBe("06:00 ~ 23:30");
  });

  it("규격은 API 응답 순서와 관계없이 소·중·대 순으로 표시한다", () => {
    const groups = formatReportViewerInformationGroups({
      ...REPORT_DETAIL,
      sizeTypes: ["LARGE", "SMALL", "MEDIUM"],
    });

    expect(groups[1]?.fields.find((field) => field.label === "규격")?.value).toBe(
      "소형, 중형, 대형",
    );
  });
});
