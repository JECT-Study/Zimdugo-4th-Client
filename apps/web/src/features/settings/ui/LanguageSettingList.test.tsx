// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageSettingList } from "./LanguageSettingList";

describe("LanguageSettingList", () => {
  afterEach(cleanup);

  it("현재 언어를 표시하고 선택한 언어를 전달한다", () => {
    const handleSelectLanguage = vi.fn();

    render(
      <LanguageSettingList
        currentLanguage="ko"
        onSelectLanguage={handleSelectLanguage}
      />,
    );

    expect(
      screen
        .getByRole("button", { name: "한국어" })
        .getAttribute("aria-pressed"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(handleSelectLanguage).toHaveBeenCalledWith("en");
  });
});
