import { describe, expect, it } from "vitest";
import { parseReportForm } from "#/features/report/model/report-schema";
import type { ReportFormValues } from "#/features/report/model/report-types";
import { reportDefaultValues } from "#/features/report/model/report-types";

const validForm = (): ReportFormValues => ({
  ...reportDefaultValues,
  roadAddress: "서울 마포구 양화로 160",
  latitude: 37.556,
  longitude: 126.923,
  indoorOutdoorType: "INDOOR",
  lockerType: "SUBWAY_STATION",
  hasFloor: false,
  locationConsentAgreed: true,
});

describe("reportSchema", () => {
  it("기본값만으로는 검증에 실패한다", () => {
    const result = parseReportForm(reportDefaultValues);
    expect(result.success).toBe(false);
  });

  it("모든 필수·조건을 충족하면 검증에 통과한다", () => {
    expect(parseReportForm(validForm()).success).toBe(true);
  });

  it("주소와 좌표는 필수이다", () => {
    const result = parseReportForm({
      ...validForm(),
      roadAddress: "",
      latitude: null,
      longitude: null,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map((i) => i.path[0])).toEqual(
      expect.arrayContaining(["roadAddress", "latitude", "longitude"]),
    );
  });

  it("위도·경도는 허용 범위를 벗어나면 실패한다", () => {
    expect(parseReportForm({ ...validForm(), latitude: 91 }).success).toBe(
      false,
    );
    expect(parseReportForm({ ...validForm(), longitude: -181 }).success).toBe(
      false,
    );
  });

  it("실내외 구분과 보관함 유형은 필수이다", () => {
    const result = parseReportForm({
      ...validForm(),
      indoorOutdoorType: null,
      lockerType: null,
    });
    expect(result.success).toBe(false);
  });

  it("층 선택 여부는 필수이다", () => {
    const result = parseReportForm({
      ...validForm(),
      hasFloor: null,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.some((issue) => issue.path[0] === "hasFloor")).toBe(
      true,
    );
  });

  it("층 있음일 때 층 유형과 층수는 필수이다", () => {
    const result = parseReportForm({
      ...validForm(),
      hasFloor: true,
      floorType: null,
      floorNumber: null,
    });
    expect(result.success).toBe(false);
  });

  it("층 있음일 때 층수는 1 이상이어야 한다", () => {
    expect(
      parseReportForm({
        ...validForm(),
        hasFloor: true,
        floorType: "UNDERGROUND",
        floorNumber: 0,
      }).success,
    ).toBe(false);
  });

  it("층 없음일 때 층 관련 필드는 null이어야 한다", () => {
    expect(
      parseReportForm({
        ...validForm(),
        hasFloor: false,
        floorType: "ABOVE_GROUND",
        floorNumber: 3,
      }).success,
    ).toBe(false);
  });

  it("가격 미선택(isFree: null)이면 가격 검증을 건너뛴다", () => {
    expect(
      parseReportForm({
        ...validForm(),
        isFree: null,
        minPrice: null,
        maxPrice: null,
      }).success,
    ).toBe(true);
  });

  it("유료(isFree: false)일 때 최소·최대 가격은 필수이다", () => {
    expect(
      parseReportForm({
        ...validForm(),
        isFree: false,
        minPrice: null,
        maxPrice: null,
      }).success,
    ).toBe(false);
  });

  it("유료일 때 가격 범위와 min ≤ max를 검증한다", () => {
    expect(
      parseReportForm({
        ...validForm(),
        isFree: false,
        minPrice: 500,
        maxPrice: 2000,
      }).success,
    ).toBe(false);

    expect(
      parseReportForm({
        ...validForm(),
        isFree: false,
        minPrice: 100_001,
        maxPrice: 100_001,
      }).success,
    ).toBe(false);

    expect(
      parseReportForm({
        ...validForm(),
        isFree: false,
        minPrice: 5000,
        maxPrice: 3000,
      }).success,
    ).toBe(false);

    expect(
      parseReportForm({
        ...validForm(),
        isFree: false,
        minPrice: 1000,
        maxPrice: 3000,
      }).success,
    ).toBe(true);
  });

  it("운영시간은 둘 다 비어 있거나 둘 다 입력해야 한다", () => {
    expect(
      parseReportForm({
        ...validForm(),
        startTime: "09:00",
        endTime: null,
      }).success,
    ).toBe(false);
  });

  it("운영시간은 시작과 종료가 같거나 역전되면 실패한다", () => {
    expect(
      parseReportForm({
        ...validForm(),
        startTime: "09:00",
        endTime: "09:00",
      }).success,
    ).toBe(false);

    expect(
      parseReportForm({
        ...validForm(),
        startTime: "22:00",
        endTime: "09:00",
      }).success,
    ).toBe(false);
  });

  it("24시간 영업(00:00 ~ 23:59)은 허용한다", () => {
    expect(
      parseReportForm({
        ...validForm(),
        startTime: "00:00",
        endTime: "23:59",
      }).success,
    ).toBe(true);
  });

  it("추가정보는 255자를 초과하면 실패한다", () => {
    expect(
      parseReportForm({
        ...validForm(),
        additionalInfo: "a".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("위치 정보 수집 동의는 true여야 한다", () => {
    expect(
      parseReportForm({ ...validForm(), locationConsentAgreed: false }).success,
    ).toBe(false);
  });

  it("imageUrl은 null만 허용한다 (TODO: S3 presigned 업로드 연동 후 URL 허용으로 schema·타입 수정 필요)", () => {
    expect(parseReportForm(validForm()).success).toBe(true);
    expect(
      reportSchemaSafeParseWithImageUrl("https://example.com/a.jpg"),
    ).toBe(false);
  });
});

function reportSchemaSafeParseWithImageUrl(imageUrl: string) {
  const values = {
    ...validForm(),
    imageUrl,
  } as unknown as ReportFormValues;
  return parseReportForm(values).success;
}
