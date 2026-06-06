import { describe, expect, it } from "vitest";
import { normalizeReportPayload } from "#/features/report/lib/normalize-report-payload";
import type { ReportFormValues } from "#/features/report/model/report-types";
import { reportDefaultValues } from "#/features/report/model/report-types";

const baseForm = (): ReportFormValues => ({
  ...reportDefaultValues,
  roadAddress: "  서울 마포구 양화로 160  ",
  latitude: 37.556,
  longitude: 126.923,
  indoorOutdoorType: "INDOOR",
  lockerType: "SUBWAY_STATION",
  locationConsentAgreed: true,
  additionalInfo: "  B2 화장실 옆  ",
});

describe("normalizeReportPayload", () => {
  it("hasFloor가 false이면 floorType과 floorNumber를 null로 보낸다", () => {
    const payload = normalizeReportPayload({
      ...baseForm(),
      hasFloor: false,
      floorType: "UNDERGROUND",
      floorNumber: 2,
    });

    expect(payload.hasFloor).toBe(false);
    expect(payload.floorType).toBeNull();
    expect(payload.floorNumber).toBeNull();
  });

  it("hasFloor가 true이면 floorType과 floorNumber를 유지한다", () => {
    const payload = normalizeReportPayload({
      ...baseForm(),
      hasFloor: true,
      floorType: "UNDERGROUND",
      floorNumber: 2,
    });

    expect(payload.floorType).toBe("UNDERGROUND");
    expect(payload.floorNumber).toBe(2);
  });

  it("isFree가 null이면 minPrice와 maxPrice를 null로 보낸다", () => {
    const payload = normalizeReportPayload({
      ...baseForm(),
      isFree: null,
      minPrice: 1000,
      maxPrice: 3000,
    });

    expect(payload.isFree).toBeNull();
    expect(payload.minPrice).toBeNull();
    expect(payload.maxPrice).toBeNull();
  });

  it("isFree가 true이면 minPrice와 maxPrice를 null로 보낸다", () => {
    const payload = normalizeReportPayload({
      ...baseForm(),
      isFree: true,
      minPrice: 1000,
      maxPrice: 3000,
    });

    expect(payload.minPrice).toBeNull();
    expect(payload.maxPrice).toBeNull();
  });

  it("isFree가 false이면 minPrice와 maxPrice를 유지한다", () => {
    const payload = normalizeReportPayload({
      ...baseForm(),
      isFree: false,
      minPrice: 1000,
      maxPrice: 3000,
    });

    expect(payload.minPrice).toBe(1000);
    expect(payload.maxPrice).toBe(3000);
  });

  it("lockerType·sizeTypes enum을 재매핑하지 않는다", () => {
    const payload = normalizeReportPayload({
      ...baseForm(),
      lockerType: "PUBLIC_OFFICE",
      sizeTypes: ["SMALL", "LARGE"],
    });

    expect(payload.lockerType).toBe("PUBLIC_OFFICE");
    expect(payload.sizeTypes).toEqual(["SMALL", "LARGE"]);
  });

  it("startTime과 endTime을 HH:mm 형식 그대로 유지한다", () => {
    const payload = normalizeReportPayload({
      ...baseForm(),
      startTime: "09:00",
      endTime: "22:30",
    });

    expect(payload.startTime).toBe("09:00");
    expect(payload.endTime).toBe("22:30");
  });

  it("roadAddress와 additionalInfo 앞뒤 공백을 제거한다", () => {
    const payload = normalizeReportPayload(baseForm());

    expect(payload.roadAddress).toBe("서울 마포구 양화로 160");
    expect(payload.additionalInfo).toBe("B2 화장실 옆");
  });

  it("imageUrl은 항상 null이다 (TODO: S3 presigned 업로드 연동 후 URL 반영)", () => {
    const payload = normalizeReportPayload(baseForm());

    expect(payload.imageUrl).toBeNull();
  });
});
