import { createBrowserHistory } from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";

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
  let cleanups: (() => void)[] = [];

  afterEach(() => {
    for (const cleanup of cleanups) cleanup();
    cleanups = [];
  });

  const waitForPopState = () =>
    new Promise<void>((resolve) => {
      window.addEventListener("popstate", () => resolve(), { once: true });
    });

  /**
   * 한국어 설정 → 언어 설정에서 영어를 골라 주소만 바꾼 상태.
   * switchAppLanguage 처럼 기존 state 를 둔 채 주소만 바꾼다.
   */
  const createSwitchedHistory = () => {
    window.history.replaceState(null, "", "/");
    const history = createBrowserHistory();
    cleanups.push(() => history.destroy());

    history.push("/settings");
    history.flush();
    const settingsKey = history.location.state.__TSR_key;

    history.push("/settings/language");
    history.flush();
    window.history.replaceState(
      window.history.state,
      "",
      "/en/settings/language",
    );

    cleanups.push(keepDocumentLocaleOnTraverse(history, "en"));

    return { history, settingsKey };
  };

  it("언어를 바꾼 뒤 뒤로가면 고른 언어의 설정 주소로 돌아간다", async () => {
    const { history } = createSwitchedHistory();

    const popped = waitForPopState();
    history.back();
    await popped;

    expect(window.location.pathname).toBe("/en/settings");
    expect(history.location.pathname).toBe("/en/settings");
  });

  it("주소를 고쳐도 항목 키를 지켜 스크롤 복원 자리를 잃지 않는다", async () => {
    const { history, settingsKey } = createSwitchedHistory();

    const popped = waitForPopState();
    history.back();
    await popped;

    expect(history.location.state.__TSR_key).toBe(settingsKey);
    expect(window.history.state.__TSR_key).toBe(settingsKey);
  });

  it("주소를 고쳐도 히스토리 항목을 늘리지 않는다", async () => {
    const { history } = createSwitchedHistory();
    const lengthBefore = window.history.length;

    const popped = waitForPopState();
    history.back();
    await popped;

    expect(window.history.length).toBe(lengthBefore);
    expect(history.canGoBack()).toBe(true);
  });

  it("앞으로 새로 여는 화면은 건드리지 않는다", () => {
    const { history } = createSwitchedHistory();

    history.push("/ja/settings");
    history.flush();

    expect(window.location.pathname).toBe("/ja/settings");
  });
});
