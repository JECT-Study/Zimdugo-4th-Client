import { describe, expect, it } from "vitest";
import {
  createNoIndexFollowMeta,
  createNoIndexNoFollowHead,
  NOINDEX_NOFOLLOW_ROBOTS_CONTENT,
} from "./robots-meta";

describe("createNoIndexNoFollowHead", () => {
  it("색인과 링크 추적을 막는 robots 메타를 만든다", () => {
    expect(createNoIndexNoFollowHead()).toEqual({
      meta: [
        {
          name: "robots",
          content: NOINDEX_NOFOLLOW_ROBOTS_CONTENT,
        },
      ],
    });
  });
});

describe("createNoIndexFollowMeta", () => {
  it("색인은 막고 링크 추적은 허용하는 robots 메타를 만든다", () => {
    expect(createNoIndexFollowMeta()).toEqual({
      name: "robots",
      content: "noindex, follow",
    });
  });
});
