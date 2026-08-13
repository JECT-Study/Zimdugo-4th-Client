import { act } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { markHomeLocationRequestedInSession } from "./home-location-request-session";
import { useHasRequestedHomeLocationInSession } from "./useHomeLocationRequestSession";

function HomeLocationRequestState() {
  const hasRequestedHomeLocation = useHasRequestedHomeLocationInSession();

  return hasRequestedHomeLocation ? <div>map</div> : <div>skeleton</div>;
}

describe("useHasRequestedHomeLocationInSession", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("hydrates with the server snapshot before applying the client session", async () => {
    const container = document.createElement("div");
    const serverMarkup = renderToString(<HomeLocationRequestState />);
    let root: Root | undefined;

    expect(serverMarkup).toContain("skeleton");

    markHomeLocationRequestedInSession();
    container.innerHTML = serverMarkup;

    await act(async () => {
      root = hydrateRoot(container, <HomeLocationRequestState />);
    });

    expect(container.textContent).toBe("map");

    await act(async () => {
      root?.unmount();
    });
  });
});
