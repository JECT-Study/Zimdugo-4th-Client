import { createMemoryHistory } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import {
  getDocumentLocaleHref,
  keepDocumentLocaleOnTraverse,
} from "./document-locale-history";

describe("getDocumentLocaleHref", () => {
  it("문서와 로케일이 같은 주소는 고치지 않는다", () => {
    expect(getDocumentLocaleHref("/en/settings", "en")).toBeNull();
    expect(getDocumentLocaleHref("/settings", "ko")).toBeNull();
  });

  it("예전 로케일 주소를 문서 로케일 주소로 고친다", () => {
    expect(getDocumentLocaleHref("/settings", "en")).toBe("/en/settings");
    expect(getDocumentLocaleHref("/ja/settings", "zh-TW")).toBe(
      "/zh-TW/settings",
    );
    expect(getDocumentLocaleHref("/en/settings", "ko")).toBe("/settings");
  });

  it("쿼리와 해시를 지킨다", () => {
    expect(getDocumentLocaleHref("/search?q=%EC%97%AD#top", "en")).toBe(
      "/en/search?q=%EC%97%AD#top",
    );
  });
});

describe("keepDocumentLocaleOnTraverse", () => {
  /** 한국어 설정 → 언어 설정에서 영어를 골라 주소만 바꾼 상태 */
  const createSwitchedHistory = () => {
    const history = createMemoryHistory({ initialEntries: ["/"] });
    history.push("/settings");
    history.push("/settings/language");
    history.replace("/en/settings/language");

    return history;
  };

  it("언어를 바꾼 뒤 뒤로가면 고른 언어의 설정 주소로 돌아간다", () => {
    const history = createSwitchedHistory();
    keepDocumentLocaleOnTraverse(history, "en");

    history.back();

    expect(history.location.pathname).toBe("/en/settings");
  });

  it("주소를 고쳐도 히스토리 항목을 늘리지 않는다", () => {
    const history = createSwitchedHistory();
    keepDocumentLocaleOnTraverse(history, "en");
    const lengthBefore = history.length;

    history.back();

    expect(history.length).toBe(lengthBefore);
    expect(history.canGoBack()).toBe(true);
  });

  it("앞으로 새로 여는 화면은 건드리지 않는다", () => {
    const history = createMemoryHistory({ initialEntries: ["/en/settings"] });
    keepDocumentLocaleOnTraverse(history, "en");

    history.push("/ja/settings");

    expect(history.location.pathname).toBe("/ja/settings");
  });
});
