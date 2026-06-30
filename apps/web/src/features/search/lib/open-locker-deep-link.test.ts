import { describe, expect, it } from "vitest";

import {
  createLockerDeepLinkSlug,
  createLockerDeepLinkUrl,
  createLockerShareText,
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

  it("percent-encodes Korean locker names while keeping the decoded slug readable", () => {
    const shareUrl = createLockerDeepLinkUrl({
      origin: "https://zimdugo-web.vercel.app",
      lockerId: 515,
      title:
        "\uAC15\uB0A8\uC5ED 4\uBC88 \uCD9C\uAD6C B1\uCE35 ES-34 \uD558\uB2E8",
    });

    expect(shareUrl).toContain("%EA%B0%95%EB%82%A8%EC%97%AD");
    expect(decodeURIComponent(new URL(shareUrl).search)).toBe(
      "?\u006C\u006F\u0063\u006B\u0065\u0072=515-\uAC15\uB0A8\uC5ED-4\uBC88-\uCD9C\uAD6C-B1\uCE35-ES-34-\uD558\uB2E8",
    );
  });
});

describe("createLockerShareText", () => {
  it("creates a localized share template with emphasized title, address, URL, comment order", () => {
    expect(
      createLockerShareText({
        locale: "ko",
        url: "https://zimdugo-web.vercel.app/?locker=515",
        title: "\uAC15\uB0A8\uC5ED 4\uBC88 \uCD9C\uAD6C \uBCF4\uAD00\uD568",
        address: "\uC11C\uC6B8 \uAC15\uB0A8\uAD6C \uD14C\uD5E4\uB780\uB85C 123",
      }),
    ).toBe(
      "[\uAC15\uB0A8\uC5ED 4\uBC88 \uCD9C\uAD6C \uBCF4\uAD00\uD568]\n\uC11C\uC6B8 \uAC15\uB0A8\uAD6C \uD14C\uD5E4\uB780\uB85C 123\nhttps://zimdugo-web.vercel.app/?locker=515\n\n\uC9D0\uB450\uACE0\uC5D0\uC11C \uC774 \uBCF4\uAD00\uD568 \uC815\uBCF4\uB97C \uD655\uC778\uD574\uBCF4\uC138\uC694.",
    );
    expect(
      createLockerShareText({
        locale: "en",
        url: "https://zimdugo-web.vercel.app/?locker=515",
        title: "Gangnam Station Locker",
        address: "123 Teheran-ro, Gangnam-gu, Seoul",
      }),
    ).toBe(
      "[Gangnam Station Locker]\n123 Teheran-ro, Gangnam-gu, Seoul\nhttps://zimdugo-web.vercel.app/?locker=515\n\nView this locker on Zimdugo.",
    );
    expect(
      createLockerShareText({
        locale: "ja",
        url: "https://zimdugo-web.vercel.app/?locker=515",
        title: "Gangnam Station Locker",
        address: "123 Teheran-ro, Gangnam-gu, Seoul",
      }).endsWith(
        "\u3053\u306E\u30ED\u30C3\u30AB\u30FC\u60C5\u5831\u3092Zimdugo\u3067\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      ),
    ).toBe(true);
    expect(
      createLockerShareText({
        locale: "zh",
        url: "https://zimdugo-web.vercel.app/?locker=515",
        title: "Gangnam Station Locker",
        address: "123 Teheran-ro, Gangnam-gu, Seoul",
      }).endsWith(
        "\u5728Zimdugo\u67E5\u770B\u8FD9\u4E2A\u884C\u674E\u67DC\u4FE1\u606F\u3002",
      ),
    ).toBe(true);
    expect(
      createLockerShareText({
        locale: "zh-TW",
        url: "https://zimdugo-web.vercel.app/?locker=515",
        title: "Gangnam Station Locker",
        address: "123 Teheran-ro, Gangnam-gu, Seoul",
      }).endsWith(
        "\u5728Zimdugo\u67E5\u770B\u9019\u500B\u884C\u674E\u6AC3\u8CC7\u8A0A\u3002",
      ),
    ).toBe(true);
  });
});
