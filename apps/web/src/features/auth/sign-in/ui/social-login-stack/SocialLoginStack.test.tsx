// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setTestLanguage } from "#/shared/test/language-runtime";
import { SocialLoginStack } from "./SocialLoginStack";

describe("SocialLoginStack", () => {
  afterEach(() => {
    cleanup();
    setTestLanguage("ko");
  });

  beforeEach(() => {
    setTestLanguage("ko");
  });

  it("shows English sub labels for non-English UI locales", () => {
    render(<SocialLoginStack />);

    expect(screen.getByText("Naver 1 second login/membership")).toBeTruthy();
  });

  it("hides English sub labels when UI locale is English", () => {
    setTestLanguage("en");

    render(<SocialLoginStack />);

    expect(screen.getByText("Naver 1-second sign-in")).toBeTruthy();
    expect(screen.queryByText("Naver 1 second login/membership")).toBeNull();
  });
});
