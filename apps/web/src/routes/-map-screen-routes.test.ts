import { beforeEach, describe, expect, it, vi } from "vitest";

const getLockerDetail = vi.hoisted(() => vi.fn());

vi.mock("#/shared/api/lockers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("#/shared/api/lockers")>()),
  getLockerDetail,
}));

const { Route: LockerRoute } = await import("./_map._screen.lockers.$slug");
const { validateMapScreenSearch } = await import("./_map._screen");
const { resolveLegacyLockerPath } = await import(
  "#/shared/lib/legacy-locker-url"
);
const { parseSearchString } = await import("#/shared/lib/search-serialization");

/** 라우터가 하는 일을 흉내 낸다. 상세 로더는 경로의 슬러그를 받는다. */
const runLoader = (slug: string) =>
  (
    LockerRoute.options as unknown as {
      loader: (ctx: { params: { slug: string } }) => Promise<{
        detail: unknown;
      }>;
    }
  ).loader({ params: { slug } });

describe("보관함 상세 라우트 로더", () => {
  beforeEach(() => {
    getLockerDetail.mockReset();
  });

  it("슬러그가 붙은 경로로 들어오면 그 보관함의 상세를 가져온다", async () => {
    getLockerDetail.mockResolvedValue({ lockerId: 521 });

    await runLoader("521-석남역-2호선");

    expect(getLockerDetail).toHaveBeenCalledWith(
      expect.objectContaining({ lockerId: 521 }),
    );
  });

  it("상세를 못 가져오면 없다고 답한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getLockerDetail.mockRejectedValue(new Error("network"));

    expect(await runLoader("521")).toEqual({ detail: null });
  });
});

/**
 * 구 딥링크가 서버 리다이렉트를 거쳐 상세 라우트의 검색 값에 닿기까지를 잇는다.
 *
 * 리다이렉트는 `detailSnap`·좌표를 쿼리로 남긴다. 검증이 그 값을 `openLockerId` 없이도
 * 읽어야 상세가 요청한 펼침과 자리로 열린다.
 */
describe("validateMapScreenSearch", () => {
  const arriveAt = (legacyHref: string) => {
    const target = new URL(
      resolveLegacyLockerPath(
        new URL(legacyHref, "https://zimdugo.com"),
      ) as string,
      "https://zimdugo.com",
    );
    return validateMapScreenSearch(parseSearchString(target.search));
  };

  it("구 딥링크의 상세 단계와 좌표를 리다이렉트 뒤에도 남긴다", () => {
    expect(
      arriveAt("/?openLockerId=164&detailSnap=full&focusLat=37.5&focusLng=127"),
    ).toMatchObject({ detailSnap: "full", focusLat: 37.5, focusLng: 127 });
  });

  it("구 상세 주소에 붙은 옵션도 리다이렉트 뒤에 남긴다", () => {
    expect(
      arriveAt("/?locker=164&detailSnap=full&focusLat=37.5&focusLng=127"),
    ).toMatchObject({ detailSnap: "full", focusLat: 37.5, focusLng: 127 });
  });

  it("상세 경로의 검색 값에 openLockerId 를 덧붙이지 않는다", () => {
    expect(validateMapScreenSearch({ detailSnap: "full" })).not.toHaveProperty(
      "openLockerId",
    );
  });

  it("앱 안에서 연 openLockerId 딥링크는 그대로 읽는다", () => {
    expect(
      validateMapScreenSearch({
        openLockerId: 164,
        detailSnap: "full",
        focusLat: 37.5,
        focusLng: 127,
      }),
    ).toMatchObject({
      openLockerId: 164,
      detailSnap: "full",
      focusLat: 37.5,
      focusLng: 127,
    });
  });

  it("검색어와 상세 아래 깔린 장소를 읽는다", () => {
    expect(validateMapScreenSearch({ q: "강남", place: "9" })).toMatchObject({
      q: "강남",
      place: 9,
    });
  });
});
