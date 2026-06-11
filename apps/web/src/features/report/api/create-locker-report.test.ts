import { beforeEach, describe, expect, it, vi } from "vitest";
import { postLockerReport } from "#/features/report/api/create-locker-report";
import type { LockerReportCreateRequest } from "#/features/report/model/report-types";
import { apiClient } from "#/shared/lib/apiClient";

vi.mock("#/shared/lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>;

const payload = {
  roadAddress: "서울 마포구 양화로 160",
  latitude: 37.556,
  longitude: 126.923,
  hasFloor: true,
  floorType: "UNDERGROUND",
  floorNumber: 2,
  indoorOutdoorType: "INDOOR",
  lockerType: "SUBWAY_STATION",
  sizeTypes: ["SMALL", "MEDIUM", "LARGE"],
  isFree: false,
  minPrice: 1000,
  maxPrice: 3000,
  startTime: "09:00",
  endTime: "22:30",
  additionalInfo: "B2 화장실 옆",
  imageUrl: "https://cdn.example.com/locker/1.jpg",
  locationConsentAgreed: true,
  floorInputValid: true,
  enumInputValid: true,
  priceInputValid: true,
  operatingHoursValid: true,
  sizeTypesValid: true,
} satisfies LockerReportCreateRequest;

describe("postLockerReport", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("userId를 query로 포함해 제보 생성 요청을 보낸다", async () => {
    postMock.mockResolvedValue({
      data: {
        code: "SUCCESS",
        message: "ok",
        status: 200,
        timestamp: "2026-06-09T00:00:00.000Z",
        data: { reportId: 1 },
      },
    });

    await postLockerReport(payload, { userId: 7 });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/locker-reports",
      payload,
      { params: { userId: 7 } },
    );
  });
});
