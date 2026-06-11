import { describe, expect, it } from "vitest";
import {
  buildLegalReturnSearch,
  parseLegalReturnSearch,
} from "./legal-return-search";

describe("legal-return-search", () => {
  it("returnTo와 step=2 search를 파싱한다", () => {
    expect(
      parseLegalReturnSearch({ returnTo: "/report", step: "2" }),
    ).toEqual({
      returnTo: "/report",
      step: 2,
    });
  });

  it("외부 URL returnTo는 무시한다", () => {
    expect(
      parseLegalReturnSearch({ returnTo: "https://evil.example", step: "2" }),
    ).toEqual({});
  });

  it("buildLegalReturnSearch는 step 2일 때만 step을 포함한다", () => {
    expect(buildLegalReturnSearch("/report", 2)).toEqual({
      returnTo: "/report",
      step: 2,
    });
    expect(buildLegalReturnSearch("/report")).toEqual({
      returnTo: "/report",
    });
  });
});
