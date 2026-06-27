import { describe, expect, it } from "vitest";
import { resolveSearchListSnapPoints } from "./SearchListBottomSheet";

describe("SearchListBottomSheet", () => {
  it("resolves search-list snaps from visible heights", () => {
    expect(resolveSearchListSnapPoints({ windowHeight: 812 })).toEqual({
      maxSnapPoint: 760,
      miniSnapPoint: 570,
      minSnapPoint: 44,
      snapPoint: 331,
    });
  });

  it("keeps caller-provided snap bounds", () => {
    expect(
      resolveSearchListSnapPoints({
        windowHeight: 812,
        minSnapPoint: 80,
        snapPoint: 320,
        maxSnapPoint: 700,
      }),
    ).toEqual({
      maxSnapPoint: 700,
      miniSnapPoint: 570,
      minSnapPoint: 80,
      snapPoint: 320,
    });
  });
});
