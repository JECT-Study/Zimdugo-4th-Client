import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLockerPins } from "#/shared/api/lockers";
import { httpGet } from "#/shared/lib/apiClient";

vi.mock("#/shared/lib/apiClient", () => ({
  httpGet: vi.fn(),
}));

const mockPinResponse = (items: unknown[]) => ({
  code: "SUCCESS",
  message: "ok",
  status: 200,
  timestamp: "2026-06-26T00:00:00.000Z",
  data: { items },
});

describe("getLockerPins", () => {
  beforeEach(() => {
    vi.mocked(httpGet).mockReset();
  });

  it("서버가 CLUSTER 대신 LOCKER 를 줘도 단일 핀으로 둔다", async () => {
    vi.mocked(httpGet).mockResolvedValue(
      mockPinResponse([
        {
          pinType: "LOCKER",
          lockerId: 1,
          placeId: null,
          latitude: 37.5,
          longitude: 127,
          isFavorite: false,
        },
      ]),
    );

    await expect(
      getLockerPins({
        swLat: 37,
        swLng: 126,
        neLat: 38,
        neLng: 128,
        zoom: 15,
      }),
    ).resolves.toEqual([
      {
        pinType: "LOCKER",
        lockerId: 1,
        placeId: null,
        latitude: 37.5,
        longitude: 127,
        isFavorite: false,
        lockerCount: null,
        pinCount: null,
        bounds: null,
      },
    ]);
  });

  it("개수가 1 이고 lockerId 가 있는 CLUSTER 는 LOCKER 로 고친다", async () => {
    vi.mocked(httpGet).mockResolvedValue(
      mockPinResponse([
        {
          pinType: "CLUSTER",
          lockerId: 1,
          placeId: null,
          latitude: 37.5,
          longitude: 127,
          isFavorite: true,
          pinCount: 1,
          bounds: {
            swLat: 37.49,
            swLng: 126.99,
            neLat: 37.51,
            neLng: 127.01,
          },
        },
      ]),
    );

    await expect(
      getLockerPins({
        swLat: 37,
        swLng: 126,
        neLat: 38,
        neLng: 128,
        zoom: 15,
      }),
    ).resolves.toEqual([
      {
        pinType: "LOCKER",
        lockerId: 1,
        placeId: null,
        latitude: 37.5,
        longitude: 127,
        isFavorite: true,
        lockerCount: null,
        pinCount: null,
        bounds: null,
      },
    ]);
  });

  it("범위를 가진 다중 CLUSTER 는 그대로 둔다", async () => {
    const bounds = {
      swLat: 37.49,
      swLng: 126.99,
      neLat: 37.51,
      neLng: 127.01,
    };

    vi.mocked(httpGet).mockResolvedValue(
      mockPinResponse([
        {
          pinType: "CLUSTER",
          lockerId: null,
          placeId: null,
          latitude: 37.5,
          longitude: 127,
          pinCount: 3,
          bounds,
        },
      ]),
    );

    await expect(
      getLockerPins({
        swLat: 37,
        swLng: 126,
        neLat: 38,
        neLng: 128,
        zoom: 12,
      }),
    ).resolves.toEqual([
      {
        pinType: "CLUSTER",
        lockerId: null,
        placeId: null,
        latitude: 37.5,
        longitude: 127,
        isFavorite: null,
        lockerCount: null,
        pinCount: 3,
        bounds,
      },
    ]);
  });

  it("개수가 1 이고 placeId 가 있는 CLUSTER 는 PLACE 로 고친다", async () => {
    vi.mocked(httpGet).mockResolvedValue(
      mockPinResponse([
        {
          pinType: "CLUSTER",
          lockerId: null,
          placeId: 10,
          latitude: 37.5,
          longitude: 127,
          lockerCount: 2,
          pinCount: 1,
          bounds: {
            swLat: 37.49,
            swLng: 126.99,
            neLat: 37.51,
            neLng: 127.01,
          },
        },
      ]),
    );

    await expect(
      getLockerPins({
        swLat: 37,
        swLng: 126,
        neLat: 38,
        neLng: 128,
        zoom: 15,
      }),
    ).resolves.toEqual([
      {
        pinType: "PLACE",
        lockerId: null,
        placeId: 10,
        latitude: 37.5,
        longitude: 127,
        isFavorite: null,
        lockerCount: 2,
        pinCount: null,
        bounds: null,
      },
    ]);
  });

  it("id 가 없는 단일 CLUSTER 는 버린다", async () => {
    vi.mocked(httpGet).mockResolvedValue(
      mockPinResponse([
        {
          pinType: "CLUSTER",
          lockerId: null,
          placeId: null,
          latitude: 37.5,
          longitude: 127,
          pinCount: 1,
          bounds: null,
        },
      ]),
    );

    await expect(
      getLockerPins({
        swLat: 37,
        swLng: 126,
        neLat: 38,
        neLng: 128,
        zoom: 15,
      }),
    ).resolves.toEqual([]);
  });

  it("키워드 핀 검색 파라미터를 pins API 로 넘긴다", async () => {
    vi.mocked(httpGet).mockResolvedValue(mockPinResponse([]));

    await getLockerPins({
      swLat: 37,
      swLng: 126,
      neLat: 38,
      neLng: 128,
      zoom: 13,
      lat: 37.5,
      lng: 127,
      keyword: "station",
      sizeTypes: ["SMALL"],
      indoorOutdoorTypes: ["INDOOR"],
      lockerTypes: ["SUBWAY_STATION"],
      minPrice: 1000,
      maxPrice: 3000,
      isFree: false,
    });

    expect(httpGet).toHaveBeenCalledWith("/api/v1/lockers/pins", {
      params: {
        swLat: 37,
        swLng: 126,
        neLat: 38,
        neLng: 128,
        zoom: 13,
        lat: 37.5,
        lng: 127,
        keyword: "station",
        sizeTypes: ["SMALL"],
        indoorOutdoorTypes: ["INDOOR"],
        lockerTypes: ["SUBWAY_STATION"],
        minPrice: 1000,
        maxPrice: 3000,
        isFree: false,
      },
      signal: undefined,
    });
  });
});
