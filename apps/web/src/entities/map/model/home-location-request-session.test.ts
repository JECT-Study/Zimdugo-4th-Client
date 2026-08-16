import { afterEach, describe, expect, it } from "vitest";
import {
  clearHomeLocationRequestedInSession,
  hasRequestedHomeLocationInSession,
  markHomeLocationRequestedInSession,
} from "./home-location-request-session";

describe("home location request session", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("returns false before the first request", () => {
    expect(hasRequestedHomeLocationInSession()).toBe(false);
  });

  it("remembers a request for the current tab session", () => {
    markHomeLocationRequestedInSession();

    expect(hasRequestedHomeLocationInSession()).toBe(true);
  });

  it("forgets a settled request", () => {
    markHomeLocationRequestedInSession();

    clearHomeLocationRequestedInSession();

    expect(hasRequestedHomeLocationInSession()).toBe(false);
  });
});
