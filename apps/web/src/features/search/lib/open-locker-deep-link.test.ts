import { describe, expect, it } from "vitest";

import {
  createLockerDeepLinkSlug,
  createLockerDeepLinkUrl,
} from "./open-locker-deep-link";

describe("createLockerDeepLinkSlug", () => {
  it("creates a shareable locker slug from id and title", () => {
    expect(
      createLockerDeepLinkSlug({
        lockerId: 515,
        title: "강남역 4번 출구 B1층 ES-34 하단",
      }),
    ).toBe("515-강남역-4번-출구-B1층-ES-34-하단");
  });

  it("uses only the locker id when title is missing or empty after cleanup", () => {
    expect(createLockerDeepLinkSlug({ lockerId: 7 })).toBe("7");
    expect(createLockerDeepLinkSlug({ lockerId: 7, title: "!!!" })).toBe("7");
  });
});

describe("createLockerDeepLinkUrl", () => {
  it("creates a clean locker share URL without search context params", () => {
    expect(
      createLockerDeepLinkUrl({
        origin: "https://zimdugo-web.vercel.app",
        lockerId: 515,
        title: "Gangnam Station Locker",
      }),
    ).toBe("https://zimdugo-web.vercel.app/?locker=515-Gangnam-Station-Locker");
  });
});
