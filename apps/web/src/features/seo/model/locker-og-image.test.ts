import { describe, expect, it, vi } from "vitest";
import {
  createLockerOgImageResponse,
  type LockerOgImageDependencies,
} from "./locker-og-image";

const REQUEST_URL = "https://zimdugo.com/og/lockers/164/map.png";

const createDependencies = (
  overrides: Partial<LockerOgImageDependencies> = {},
): LockerOgImageDependencies => ({
  env: {
    VITE_NAVER_MAP_CLIENT_ID: "client-id",
    NAVER_MAP_CLIENT_SECRET: "client-secret",
  },
  getDetail: vi.fn().mockResolvedValue({
    latitude: 37.5665,
    longitude: 126.978,
  }),
  fetchMap: vi.fn().mockResolvedValue(
    new Response(new Uint8Array([137, 80, 78, 71]), {
      headers: { "Content-Type": "image/png" },
    }),
  ),
  createAbortSignal: () => new AbortController().signal,
  ...overrides,
});

describe("createLockerOgImageResponse", () => {
  it("보관함 ID가 올바르지 않으면 기본 이미지로 보낸다", async () => {
    const dependencies = createDependencies();

    const response = await createLockerOgImageResponse({
      rawLockerId: "invalid",
      requestUrl: REQUEST_URL,
      dependencies,
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://zimdugo.com/images/og-default.png",
    );
    expect(dependencies.getDetail).not.toHaveBeenCalled();
  });

  it("서버용 지도 키가 없으면 상세를 조회하지 않고 기본 이미지로 보낸다", async () => {
    const dependencies = createDependencies({ env: {} });

    const response = await createLockerOgImageResponse({
      rawLockerId: "164",
      requestUrl: REQUEST_URL,
      dependencies,
    });

    expect(response.status).toBe(302);
    expect(dependencies.getDetail).not.toHaveBeenCalled();
    expect(dependencies.fetchMap).not.toHaveBeenCalled();
  });

  it("상세 좌표로 1200×630 고해상도 지도와 브랜드 마커를 요청한다", async () => {
    const dependencies = createDependencies();

    const response = await createLockerOgImageResponse({
      rawLockerId: "164",
      requestUrl: REQUEST_URL,
      dependencies,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=604800");
    expect(dependencies.getDetail).toHaveBeenCalledWith(
      164,
      expect.any(AbortSignal),
    );

    const [requestUrl, requestInit] = vi.mocked(dependencies.fetchMap).mock
      .calls[0];
    const url = new URL(String(requestUrl));
    const headers = new Headers(requestInit?.headers);

    expect(url.origin).toBe("https://maps.apigw.ntruss.com");
    expect(url.searchParams.get("w")).toBe("600");
    expect(url.searchParams.get("h")).toBe("315");
    expect(url.searchParams.get("scale")).toBe("2");
    expect(url.searchParams.get("center")).toBe("126.978,37.5665");
    expect(url.searchParams.get("markers")).toBe(
      "type:e|anchor:center|icon:https://zimdugo.com/icons/map-marker-64x64.png|pos:126.978 37.5665",
    );
    expect(headers.get("x-ncp-apigw-api-key-id")).toBe("client-id");
    expect(headers.get("x-ncp-apigw-api-key")).toBe("client-secret");
  });

  it("지도 API가 이미지가 아닌 응답을 주면 기본 이미지로 보낸다", async () => {
    const dependencies = createDependencies({
      fetchMap: vi.fn().mockResolvedValue(
        new Response("rate limited", {
          status: 429,
          headers: { "Content-Type": "text/plain" },
        }),
      ),
    });

    const response = await createLockerOgImageResponse({
      rawLockerId: "164",
      requestUrl: REQUEST_URL,
      dependencies,
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://zimdugo.com/images/og-default.png",
    );
  });

  it("지도 이미지 본문을 읽는 중 실패하면 기본 이미지로 보낸다", async () => {
    const failedBody = new ReadableStream({
      start(controller) {
        controller.error(new Error("stream failed"));
      },
    });
    const dependencies = createDependencies({
      fetchMap: vi.fn().mockResolvedValue(
        new Response(failedBody, {
          headers: { "Content-Type": "image/png" },
        }),
      ),
    });

    const response = await createLockerOgImageResponse({
      rawLockerId: "164",
      requestUrl: REQUEST_URL,
      dependencies,
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://zimdugo.com/images/og-default.png",
    );
  });
});
