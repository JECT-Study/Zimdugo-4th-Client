import { describe, expect, it } from "vitest";
import { getRemainingTimeParts } from "./locker-timer-format";

describe("getRemainingTimeParts", () => {
  it("1분이 되지 않아도 0분으로 내려가지 않는다", () => {
    expect(getRemainingTimeParts(59)).toEqual({ hours: 0, minutes: 1 });
    expect(getRemainingTimeParts(1)).toEqual({ hours: 0, minutes: 1 });
  });

  it("분을 올린 결과가 60분이 되면 시간으로 넘긴다", () => {
    expect(getRemainingTimeParts(7199)).toEqual({ hours: 2, minutes: 0 });
    expect(getRemainingTimeParts(3541)).toEqual({ hours: 1, minutes: 0 });
  });

  it("딱 떨어지는 시각은 그대로 둔다", () => {
    expect(getRemainingTimeParts(7200)).toEqual({ hours: 2, minutes: 0 });
    expect(getRemainingTimeParts(19800)).toEqual({ hours: 5, minutes: 30 });
  });

  it("남은 시간이 없으면 0으로 둔다", () => {
    expect(getRemainingTimeParts(0)).toEqual({ hours: 0, minutes: 0 });
    expect(getRemainingTimeParts(-10)).toEqual({ hours: 0, minutes: 0 });
  });
});
