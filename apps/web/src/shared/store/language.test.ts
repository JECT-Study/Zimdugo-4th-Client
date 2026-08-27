import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getLanguageSwitchHref,
  getLocalizedHref,
  switchAppLanguage,
} from "./language";

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
  it("adds the locale prefix for non-base languages", () => {
    expect(getLocalizedHref("/settings", "en")).toBe("/en/settings");
    expect(getLocalizedHref("/", "ja")).toBe("/ja");
    expect(getLocalizedHref("/notices/1", "zh-TW")).toBe("/zh-TW/notices/1");
  });

  it("strips the locale prefix for the base language", () => {
    expect(getLocalizedHref("/en/settings", "ko")).toBe("/settings");
    expect(getLocalizedHref("/ja", "ko")).toBe("/");
  });

  it("replaces an existing locale prefix", () => {
    expect(getLocalizedHref("/en/settings", "ja")).toBe("/ja/settings");
  });

  it("keeps the search string and hash", () => {
    expect(getLocalizedHref("/settings?tab=language#current", "en")).toBe(
      "/en/settings?tab=language#current",
    );
  });

  it("keeps absolute hrefs absolute", () => {
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

describe("getLanguageSwitchHref", () => {
  it("고른 로케일과 돌아갈 자리를 전용 경로에 담는다", () => {
    expect(getLanguageSwitchHref("/settings/language", "en")).toBe(
      "/set-language/en/settings/language",
    );
    expect(getLanguageSwitchHref("/en/settings/language", "ja")).toBe(
      "/set-language/ja/settings/language",
    );
  });

  it("기본 로케일도 같은 경로를 쓴다", () => {
    // 프리렌더된 자리로 곧장 보내면 정적 파일이 먼저 응답해 선택이 기록되지
    // 않는다. 기본 로케일이야말로 프리렌더 대상이라 예외를 둘 수 없다.
    expect(getLanguageSwitchHref("/en/settings/language", "ko")).toBe(
      "/set-language/ko/settings/language",
    );
  });

  it("홈에서도 자리를 잃지 않는다", () => {
    expect(getLanguageSwitchHref("/", "en")).toBe("/set-language/en/");
    expect(getLanguageSwitchHref("/ja", "en")).toBe("/set-language/en");
  });

  it("원래 쿼리와 해시를 그대로 들고 간다", () => {
    expect(getLanguageSwitchHref("/settings?tab=language#now", "en")).toBe(
      "/set-language/en/settings?tab=language#now",
    );
  });
});

describe("switchAppLanguage", () => {
  beforeEach(() => {
    clearLocaleCookie();
  });

  it("선택 주소로 이동한다", () => {
    const assign = vi.fn();
    vi.spyOn(window, "location", "get").mockReturnValue({
      pathname: "/en/settings/language",
      search: "",
      hash: "",
      assign,
    } as unknown as Location);

    switchAppLanguage("ja");

    expect(assign).toHaveBeenCalledWith("/set-language/ja/settings/language");
    vi.restoreAllMocks();
  });

  it("선호 쿠키를 여기서 쓰지 않는다", () => {
    // 기록은 서버 한 곳에서만 한다. 링크로 눌리면 이 코드가 아예 안 돈다.
    const assign = vi.fn();
    vi.spyOn(window, "location", "get").mockReturnValue({
      pathname: "/settings/language",
      search: "",
      hash: "",
      assign,
    } as unknown as Location);

    switchAppLanguage("en");

    expect(readLocaleCookie()).toBeNull();
    vi.restoreAllMocks();
  });

  it("모르는 값이면 아무것도 하지 않는다", () => {
    const assign = vi.fn();
    vi.spyOn(window, "location", "get").mockReturnValue({
      pathname: "/settings/language",
      search: "",
      hash: "",
      assign,
    } as unknown as Location);

    switchAppLanguage("fr" as never);

    expect(assign).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
