import { describe, expect, it } from "vitest";

import {
  getMapContainerSize,
  hasUsableMapContainerSize,
} from "./map-container-layout";

describe("map-container-layout", () => {
  it("0×0 컨테이너는 사용 불가로 판단한다", () => {
    const element = {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    const size = getMapContainerSize(element);
    expect(hasUsableMapContainerSize(size)).toBe(false);
  });

  it("양수 크기 컨테이너는 사용 가능으로 판단한다", () => {
    expect(hasUsableMapContainerSize({ width: 390, height: 700 })).toBe(true);
  });
});
