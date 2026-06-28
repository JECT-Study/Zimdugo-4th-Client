import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLockerPins } from "#/shared/api/lockers";
import { httpGet } from "#/shared/lib/apiClient";

vi.mock("#/shared/lib/apiClient", () => ({
  httpGet: vi.fn(),
}));

const mockPinResponse = (items: unknown[]) => ({
  data: {
    code: "SUCCESS",
    message: "ok",
    status: 200,
    timestamp: "2026-06-26T00:00:00.000Z",
    data: { items },
  },
});

describe("getLockerPins", () => {
  beforeEach(() => {
    vi.mocked(httpGet).mockReset();
  });

  it("keeps single pins when the server sends LOCKER instead of CLUSTER", async () => {
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

  it("normalizes single-count CLUSTER responses with lockerId to LOCKER", async () => {
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

  it("keeps valid multi-count CLUSTER responses with bounds", async () => {
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

  it("normalizes single-count CLUSTER responses with placeId to PLACE", async () => {
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

  it("drops single-count CLUSTER responses without a lockerId or placeId", async () => {
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

  it("forwards keyword pin search params to the pins API", async () => {
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
      },
      signal: undefined,
    });
  });
});
