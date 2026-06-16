// @vitest-environment jsdom

import { setLanguageTag } from "@repo/i18n";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SocialLoginStack } from "./SocialLoginStack";

describe("SocialLoginStack", () => {
  afterEach(() => {
    cleanup();
    setLanguageTag("ko");
  });

  beforeEach(() => {
    setLanguageTag("ko");
  });

  it("shows English sub labels for non-English UI locales", () => {
    render(<SocialLoginStack />);

    expect(screen.getByText("Naver 1 second login/membership")).toBeTruthy();
  });

  it("hides English sub labels when UI locale is English", () => {
    setLanguageTag("en");

    render(<SocialLoginStack />);

    expect(screen.getByText("Naver 1-second sign-in")).toBeTruthy();
    expect(screen.queryByText("Naver 1 second login/membership")).toBeNull();
  });
});
