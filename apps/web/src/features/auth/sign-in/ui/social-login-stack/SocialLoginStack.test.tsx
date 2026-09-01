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

  it("영어가 아닌 화면에서는 영문 보조 라벨을 보인다", () => {
    render(<SocialLoginStack />);

    expect(screen.getByText("Naver 1 second login/membership")).toBeTruthy();
  });

  it("화면이 영어면 영문 보조 라벨을 감춘다", () => {
    setTestLanguage("en");

    render(<SocialLoginStack />);

    expect(screen.getByText("Naver 1-second sign-in")).toBeTruthy();
    expect(screen.queryByText("Naver 1 second login/membership")).toBeNull();
  });
});
