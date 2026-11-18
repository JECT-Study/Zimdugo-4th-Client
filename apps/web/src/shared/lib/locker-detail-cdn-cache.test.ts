import { describe, expect, it } from "vitest";
import {
  LOCKER_DETAIL_CDN_CACHE_CONTROL,
  withLockerDetailCdnCache,
} from "./locker-detail-cdn-cache";

const html = (init: ResponseInit = {}) =>
  new Response("<html></html>", {
    status: 200,
    ...init,
    headers: { "content-type": "text/html; charset=utf-8", ...init.headers },
  });

const cdnCacheOf = (response: Response) =>
  response.headers.get("vercel-cdn-cache-control");

describe("withLockerDetailCdnCache", () => {
  it("접두사가 있는 상세 문서의 200 응답은 CDN 에 담는다", () => {
    const response = withLockerDetailCdnCache(
      new Request("https://zimdugo.com/en/lockers/1326?q=gangnam"),
      "en",
      html(),
    );

    expect(cdnCacheOf(response)).toBe(LOCKER_DETAIL_CDN_CACHE_CONTROL);
    expect(response.status).toBe(200);
  });

  it("접두사 없는 상세는 로케일 판정이 요청마다 달라 담지 않는다", () => {
    expect(
      cdnCacheOf(
        withLockerDetailCdnCache(
          new Request("https://zimdugo.com/lockers/1326"),
          null,
          html(),
        ),
      ),
    ).toBeNull();
  });

  it("상세가 아닌 문서는 담지 않는다", () => {
    expect(
      cdnCacheOf(
        withLockerDetailCdnCache(
          new Request("https://zimdugo.com/en/places/453"),
          "en",
          html(),
        ),
      ),
    ).toBeNull();
  });

  it("404·503 응답은 일시 상태가 굳지 않게 담지 않는다", () => {
    for (const status of [404, 503]) {
      expect(
        cdnCacheOf(
          withLockerDetailCdnCache(
            new Request("https://zimdugo.com/en/lockers/999999999"),
            "en",
            html({ status }),
          ),
        ),
      ).toBeNull();
    }
  });

  it("쿠키를 심는 응답은 다른 사람에게 건너가지 않게 담지 않는다", () => {
    expect(
      cdnCacheOf(
        withLockerDetailCdnCache(
          new Request("https://zimdugo.com/ja/lockers/1326"),
          "ja",
          html({ headers: { "set-cookie": "PARAGLIDE_LOCALE=ja" } }),
        ),
      ),
    ).toBeNull();
  });

  it("GET 이 아닌 요청은 담지 않는다", () => {
    expect(
      cdnCacheOf(
        withLockerDetailCdnCache(
          new Request("https://zimdugo.com/en/lockers/1326", {
            method: "HEAD",
          }),
          "en",
          html(),
        ),
      ),
    ).toBeNull();
  });
});
