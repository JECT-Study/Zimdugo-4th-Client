import { describe, expect, it } from "vitest";
import { createApiClient } from "@repo/libs/axios";

describe("createApiClient", () => {
  it("serializes array query params without bracket suffixes", () => {
    const client = createApiClient("http://example.com");

    const uri = client.getUri({
      url: "/api/v1/lockers/search",
      params: {
        keyword: "잠실",
        lat: 37.5,
        lng: 127.1,
        sizeTypes: ["SMALL"],
        indoorOutdoorTypes: ["INDOOR"],
        lockerTypes: ["SUBWAY_STATION"],
      },
    });

    expect(uri).toContain("sizeTypes=SMALL");
    expect(uri).toContain("indoorOutdoorTypes=INDOOR");
    expect(uri).toContain("lockerTypes=SUBWAY_STATION");
    expect(uri).not.toContain("sizeTypes%5B%5D");
    expect(uri).not.toContain("indoorOutdoorTypes%5B%5D");
    expect(uri).not.toContain("lockerTypes%5B%5D");
  });
});
