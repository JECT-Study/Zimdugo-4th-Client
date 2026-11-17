import { beforeEach, describe, expect, it, vi } from "vitest";

const getLockerDetail = vi.hoisted(() => vi.fn());

vi.mock("#/shared/api/lockers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("#/shared/api/lockers")>()),
  getLockerDetail,
}));

const { Route } = await import("./_map.index");
const { resolveLegacyLockerPath } = await import(
  "#/shared/lib/legacy-locker-url"
);
const { toInternalLockerUrl } = await import("#/shared/lib/locker-path-url");
const { parseSearchString } = await import("#/shared/lib/search-serialization");

/**
 * 라우터가 하는 일을 그대로 흉내 낸다. 검색 파라미터는 `loaderDeps` 만 받고, 로더는
 * 그 결과를 `deps` 로 받는다. 로더에 `search` 를 넘기지 않는 것이 핵심이다.
 */
const runLoader = async (search: Record<string, unknown>) => {
  const options = Route.options as unknown as {
    loaderDeps: (ctx: { search: Record<string, unknown> }) => unknown;
    loader: (ctx: { deps: unknown }) => Promise<{ detail: unknown }>;
  };
  const deps = options.loaderDeps({ search });
  return options.loader({ deps });
};

describe("홈 라우트 로더", () => {
  beforeEach(() => {
    getLockerDetail.mockReset();
  });

  it("슬러그가 붙은 보관함 주소로 들어오면 그 보관함의 상세를 가져온다", async () => {
    getLockerDetail.mockResolvedValue({ lockerId: 521 });

    await runLoader({ locker: "521-석남역-2호선" });

    expect(getLockerDetail).toHaveBeenCalledWith(
      expect.objectContaining({ lockerId: 521 }),
    );
  });

  it("보관함 주소가 아니면 상세를 가져오지 않는다", async () => {
    const result = await runLoader({ q: "강남역" });

    expect(getLockerDetail).not.toHaveBeenCalled();
    expect(result).toEqual({ detail: null });
  });

  it("상세를 못 가져오면 없다고 답한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getLockerDetail.mockRejectedValue(new Error("network"));

    const result = await runLoader({ locker: "521" });

    expect(result).toEqual({ detail: null });
  });
});

/**
 * 구 딥링크가 서버 리다이렉트와 라우터 변환을 거쳐 홈 화면에 닿기까지를 잇는다.
 *
 * 각 단계는 따로 테스트돼 있지만, 옵션은 단계 사이에서 사라졌다. 리다이렉트는
 * `detailSnap`·좌표를 쿼리로 남기는데 `validateSearch` 가 `openLockerId` 없이는 그
 * 옵션을 읽지 않았다. 그래서 끝에서 끝까지를 한 번에 본다.
 */
describe("홈 라우트 validateSearch", () => {
  const validate = (search: Record<string, unknown>) =>
    (
      Route.options as unknown as {
        validateSearch: (search: Record<string, unknown>) => unknown;
      }
    ).validateSearch(search);

  const arriveAt = (legacyHref: string) => {
    const legacy = new URL(legacyHref, "https://zimdugo.com");
    const target = new URL(
      resolveLegacyLockerPath(legacy) as string,
      "https://zimdugo.com",
    );
    return validate(parseSearchString(toInternalLockerUrl(target).search));
  };

  it("구 딥링크의 상세 단계와 좌표를 리다이렉트 뒤에도 남긴다", () => {
    expect(
      arriveAt("/?openLockerId=164&detailSnap=full&focusLat=37.5&focusLng=127"),
    ).toMatchObject({
      locker: "164",
      detailSnap: "full",
      focusLat: 37.5,
      focusLng: 127,
    });
  });

  it("구 상세 주소에 붙은 옵션도 리다이렉트 뒤에 남긴다", () => {
    expect(
      arriveAt("/?locker=164&detailSnap=full&focusLat=37.5&focusLng=127"),
    ).toMatchObject({
      locker: "164",
      detailSnap: "full",
      focusLat: 37.5,
      focusLng: 127,
    });
  });

  it("locker 로 들어온 상세에 openLockerId 를 덧붙이지 않는다", () => {
    expect(validate({ locker: "164", detailSnap: "full" })).not.toHaveProperty(
      "openLockerId",
    );
  });

  it("앱 안에서 연 openLockerId 딥링크는 그대로 읽는다", () => {
    expect(
      validate({
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

  it("상세가 없는 주소에는 딥링크 옵션을 남기지 않는다", () => {
    expect(validate({ q: "강남", detailSnap: "full" })).not.toHaveProperty(
      "detailSnap",
    );
  });
});
