import { beforeEach, describe, expect, it, vi } from "vitest";

const getLockerDetail = vi.hoisted(() => vi.fn());

vi.mock("#/shared/api/lockers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("#/shared/api/lockers")>()),
  getLockerDetail,
}));

const { Route } = await import("./_map.index");

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
