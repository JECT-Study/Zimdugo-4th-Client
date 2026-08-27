import { createApiClient, createApiMethods } from "@repo/libs/axios";
import type { AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";

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

// 앱의 API 모듈은 전부 이 래퍼를 거치고, 테스트에서는 래퍼를 목으로 바꾼다.
// 그래서 "AxiosResponse 가 아니라 응답 body 를 돌려준다" 는 계약을 실제로
// 검증하는 곳이 여기뿐이다. 이 계약이 깨지면 호출부가 한 겹 더 벗기거나
// 덜 벗기게 되고, 그 오류는 타입으로 잡히지 않는다.
describe("createApiMethods", () => {
  const body = { code: "SUCCESS", data: { id: 1 } };

  const createStubClient = () => {
    const respond = vi.fn().mockResolvedValue({
      data: body,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    });

    return {
      client: {
        get: respond,
        post: respond,
        put: respond,
        patch: respond,
        delete: respond,
      } as unknown as AxiosInstance,
      respond,
    };
  };

  it("returns the response body instead of the AxiosResponse envelope", async () => {
    const { client } = createStubClient();
    const { httpGet, httpPost, httpPut, httpPatch, httpDelete } =
      createApiMethods(client);

    await expect(httpGet("/x")).resolves.toBe(body);
    await expect(httpPost("/x")).resolves.toBe(body);
    await expect(httpPut("/x")).resolves.toBe(body);
    await expect(httpPatch("/x")).resolves.toBe(body);
    await expect(httpDelete("/x")).resolves.toBe(body);
  });

  it("passes url, request body and config through to the client", async () => {
    const { client, respond } = createStubClient();
    const { httpGet, httpPost, httpDelete } = createApiMethods(client);
    const config = { params: { page: 0 } };
    const payload = { name: "잠실" };

    await httpGet("/get", config);
    expect(respond).toHaveBeenLastCalledWith("/get", config);

    await httpPost("/post", payload, config);
    expect(respond).toHaveBeenLastCalledWith("/post", payload, config);

    await httpDelete("/delete", config);
    expect(respond).toHaveBeenLastCalledWith("/delete", config);
  });

  it("rejects when the underlying client rejects", async () => {
    const failure = new Error("network down");
    const client = {
      post: vi.fn().mockRejectedValue(failure),
    } as unknown as AxiosInstance;
    const { httpPost } = createApiMethods(client);

    await expect(httpPost("/x")).rejects.toBe(failure);
  });
});
