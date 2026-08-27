// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LanguageSettingList } from "./LanguageSettingList";

describe("LanguageSettingList", () => {
  afterEach(cleanup);

  it("현재 언어를 표시하고 각 언어를 링크로 건다", () => {
    render(
      <LanguageSettingList
        currentLanguage="ko"
        getLanguageHref={(language) => `/switch/${language}`}
      />,
    );

    expect(
      screen.getByRole("link", { name: "한국어" }).getAttribute("aria-current"),
    ).toBe("true");

    // 버튼이 아니라 링크여야 한다. 하이드레이션 전 클릭은 핸들러가 없어
    // 사라지지만, 링크는 브라우저가 처리한다.
    expect(
      screen.getByRole("link", { name: "English" }).getAttribute("href"),
    ).toBe("/switch/en");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
