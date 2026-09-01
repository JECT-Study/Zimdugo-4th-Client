import { beforeEach, describe, expect, it } from "vitest";

import { getLocalizedHref, setAppLanguage } from "./language";

const LOCALE_COOKIE_NAME = "PARAGLIDE_LOCALE";

const clearLocaleCookie = () => {
  document.cookie = `${LOCALE_COOKIE_NAME}=;path=/;max-age=0`;
};

const readLocaleCookie = () => {
  const entry = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${LOCALE_COOKIE_NAME}=`));

  return entry?.split("=").slice(1).join("=") ?? null;
};

describe("getLocalizedHref", () => {
  it("base 가 아닌 언어에는 로케일 접두사를 붙인다", () => {
    expect(getLocalizedHref("/settings", "en")).toBe("/en/settings");
    expect(getLocalizedHref("/", "ja")).toBe("/ja");
    expect(getLocalizedHref("/notices/1", "zh-TW")).toBe("/zh-TW/notices/1");
  });

  it("base 언어에서는 로케일 접두사를 뗀다", () => {
    expect(getLocalizedHref("/en/settings", "ko")).toBe("/settings");
    expect(getLocalizedHref("/ja", "ko")).toBe("/");
  });

  it("이미 있는 로케일 접두사를 갈아 끼운다", () => {
    expect(getLocalizedHref("/en/settings", "ja")).toBe("/ja/settings");
  });

  it("쿼리와 해시를 지킨다", () => {
    expect(getLocalizedHref("/settings?tab=language#current", "en")).toBe(
      "/en/settings?tab=language#current",
    );
  });

  it("절대 주소는 절대 주소로 둔다", () => {
    expect(getLocalizedHref("https://zimdugo.com/settings", "en")).toBe(
      "https://zimdugo.com/en/settings",
    );
  });

  it("프로토콜 상대 주소는 호스트 표기를 유지한 채 로케일만 넣는다", () => {
    expect(getLocalizedHref("//zimdugo.com/settings", "en")).toBe(
      "//zimdugo.com/en/settings",
    );
    expect(getLocalizedHref("//zimdugo.com/en/settings", "ko")).toBe(
      "//zimdugo.com/settings",
    );
  });
});

describe("setAppLanguage", () => {
  beforeEach(() => {
    clearLocaleCookie();
  });

  it("고른 언어를 로케일 쿠키에 적는다", () => {
    setAppLanguage("en");

    expect(readLocaleCookie()).toBe("en");
  });

  it("먼저 저장된 선호를 덮어쓴다", () => {
    setAppLanguage("en");
    setAppLanguage("zh-TW");

    expect(readLocaleCookie()).toBe("zh-TW");
  });

  it("지원하지 않는 값은 무시한다", () => {
    setAppLanguage("fr" as never);

    expect(readLocaleCookie()).toBeNull();
  });
});
