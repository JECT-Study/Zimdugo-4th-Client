import { describe, expect, it } from "vitest";
import {
  createNoIndexNoFollowHead,
  NOINDEX_NOFOLLOW_ROBOTS_CONTENT,
} from "./robots-meta";

describe("createNoIndexNoFollowHead", () => {
  it("creates a robots meta tag that blocks indexing and link following", () => {
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
