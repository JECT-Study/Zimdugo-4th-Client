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

  it("drops invalid CLUSTER responses with pinCount less than or equal to 1", async () => {
    vi.mocked(httpGet).mockResolvedValue(
      mockPinResponse([
        {
          pinType: "CLUSTER",
          lockerId: null,
          placeId: null,
          latitude: 37.5,
          longitude: 127,
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
    ).resolves.toEqual([]);
  });
});
