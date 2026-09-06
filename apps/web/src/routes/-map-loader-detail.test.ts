import { describe, expect, it } from "vitest";
import { pickMapLoaderDetail } from "./-map-loader-detail";

const detail = { latitude: 37.4979, longitude: 127.0276 };

describe("pickMapLoaderDetail", () => {
  it("매치가 없으면 없다고 답한다", () => {
    expect(pickMapLoaderDetail([])).toBeNull();
  });

  it("자식 매치가 가져온 상세를 꺼낸다", () => {
    expect(
      pickMapLoaderDetail([
        { loaderData: undefined },
        { loaderData: undefined },
        { loaderData: { detail } },
      ]),
    ).toEqual(detail);
  });

  /** 로더가 못 찾으면 `{ detail: null }` 을 준다. 그것도 답이라 더 거슬러 올라가지 않는다. */
  it("자식이 못 찾았다고 답했으면 위쪽 매치를 뒤지지 않는다", () => {
    expect(
      pickMapLoaderDetail([
        { loaderData: { detail } },
        { loaderData: { detail: null } },
      ]),
    ).toBeNull();
  });

  it("상세를 아는 매치가 위에 있어도 찾아낸다", () => {
    expect(
      pickMapLoaderDetail([
        { loaderData: { detail } },
        { loaderData: { somethingElse: 1 } },
      ]),
    ).toEqual(detail);
  });

  it("로더가 없는 매치만 있으면 없다고 답한다", () => {
    expect(
      pickMapLoaderDetail([{ loaderData: undefined }, { loaderData: {} }]),
    ).toBeNull();
  });

  /** 매치의 loaderData 는 라우터가 채우는 값이라 무엇이든 올 수 있다. */
  it("객체가 아닌 loaderData 는 건너뛴다", () => {
    expect(
      pickMapLoaderDetail([
        { loaderData: { detail } },
        { loaderData: "unexpected" },
        { loaderData: 42 },
      ]),
    ).toEqual(detail);
  });
});
