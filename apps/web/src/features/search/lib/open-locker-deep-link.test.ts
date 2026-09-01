import { describe, expect, it } from "vitest";

import {
  createLockerCanonicalUrl,
  createLockerDeepLinkSlug,
  createLockerDeepLinkUrl,
  createLockerShareText,
} from "./open-locker-deep-link";

describe("createLockerDeepLinkSlug", () => {
  it("id 와 제목으로 공유용 보관함 슬러그를 만든다", () => {
    expect(
      createLockerDeepLinkSlug({
        lockerId: 515,
        title: "강남역 4번 출구 B1층 ES-34 하단",
      }),
    ).toBe("515-강남역-4번-출구-B1층-ES-34-하단");
  });

  it("제목이 없거나 정리 후 비면 보관함 id 만 쓴다", () => {
    expect(createLockerDeepLinkSlug({ lockerId: 7 })).toBe("7");
    expect(createLockerDeepLinkSlug({ lockerId: 7, title: "!!!" })).toBe("7");
  });
});

describe("createLockerDeepLinkUrl", () => {
  it("검색 컨텍스트 파라미터 없는 공유 주소를 만든다", () => {
    expect(
      createLockerDeepLinkUrl({
        origin: "https://zimdugo-web.vercel.app",
        lockerId: 515,
        title: "Gangnam Station Locker",
      }),
    ).toBe("https://zimdugo-web.vercel.app/?locker=515-Gangnam-Station-Locker");
  });

  it("로케일이 오면 접두사를 붙인 보관함 주소를 만든다", () => {
    expect(
      createLockerDeepLinkUrl({
        origin: "https://zimdugo.com",
        lockerId: 515,
        title: "Gangnam Station Locker",
        locale: "en",
      }),
    ).toBe("https://zimdugo.com/en?locker=515-Gangnam-Station-Locker");
  });

  it("한글 이름을 인코딩하되 풀었을 때 읽히게 남긴다", () => {
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

describe("createLockerCanonicalUrl", () => {
  it("검색 컨텍스트 없는 절대 canonical 주소를 만든다", () => {
    expect(
      createLockerCanonicalUrl({
        lockerId: 515,
        title:
          "\uAC15\uB0A8\uC5ED 4\uBC88 \uCD9C\uAD6C B1\uCE35 ES-34 \uD558\uB2E8",
      }),
    ).toBe(
      "https://zimdugo.com/?locker=515-%EA%B0%95%EB%82%A8%EC%97%AD-4%EB%B2%88-%EC%B6%9C%EA%B5%AC-B1%EC%B8%B5-ES-34-%ED%95%98%EB%8B%A8",
    );
  });

  it("로케일이 오면 접두사를 붙인 canonical 주소를 만든다", () => {
    expect(
      createLockerCanonicalUrl({
        lockerId: 515,
        title: "Gangnam Station Locker",
        locale: "en",
      }),
    ).toBe("https://zimdugo.com/en?locker=515-Gangnam-Station-Locker");
  });
});

describe("createLockerShareText", () => {
  it("제목·주소·읽히는 주소·안내문 순서로 로케일별 공유 문구를 만든다", () => {
    expect(
      createLockerShareText({
        locale: "ko",
        url: "https://zimdugo-web.vercel.app/?locker=515-%EA%B0%95%EB%82%A8%EC%97%AD-4%EB%B2%88-%EC%B6%9C%EA%B5%AC",
        title: "\uAC15\uB0A8\uC5ED 4\uBC88 \uCD9C\uAD6C \uBCF4\uAD00\uD568",
        address: "\uC11C\uC6B8 \uAC15\uB0A8\uAD6C \uD14C\uD5E4\uB780\uB85C 123",
      }),
    ).toBe(
      "[\uAC15\uB0A8\uC5ED 4\uBC88 \uCD9C\uAD6C \uBCF4\uAD00\uD568]\n\uC11C\uC6B8 \uAC15\uB0A8\uAD6C \uD14C\uD5E4\uB780\uB85C 123\n\nhttps://zimdugo-web.vercel.app/?locker=515-\uAC15\uB0A8\uC5ED-4\uBC88-\uCD9C\uAD6C\n\n\uC9D0\uB450\uACE0\uC5D0\uC11C \uC704 \uBCF4\uAD00\uD568 \uC815\uBCF4\uB97C \uD655\uC778\uD574\uBCF4\uC138\uC694.",
    );
    expect(
      createLockerShareText({
        locale: "en",
        url: "https://zimdugo-web.vercel.app/?locker=515",
        title: "Gangnam Station Locker",
        address: "123 Teheran-ro, Gangnam-gu, Seoul",
      }),
    ).toBe(
      "[Gangnam Station Locker]\n123 Teheran-ro, Gangnam-gu, Seoul\n\nhttps://zimdugo-web.vercel.app/?locker=515\n\nView this locker on Zimdugo.",
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

  it("주소에 비 ASCII 가 있어도 읽히게 남기고 끝에 빈 줄을 두지 않는다", () => {
    const shareText = createLockerShareText({
      locale: "en",
      url: "https://zimdugo-web.vercel.app/?locker=77-%E6%96%B0%E5%AE%BF-%E3%83%AD%E3%83%83%E3%82%AB%E3%83%BC",
      title: "Shinjuku Locker",
      address: "Shinjuku Station",
    });

    expect(shareText).toBe(
      "[Shinjuku Locker]\nShinjuku Station\n\nhttps://zimdugo-web.vercel.app/?locker=77-\u65B0\u5BBF-\u30ED\u30C3\u30AB\u30FC\n\nView this locker on Zimdugo.",
    );
    expect(shareText.endsWith("\n")).toBe(false);
    expect(shareText.endsWith(" ")).toBe(false);
  });
});
