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

  it("클라이언트 세션을 적용하기 전에 서버 스냅숏으로 하이드레이트한다", async () => {
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
