// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GtmBodyNoscript, GtmHeadScript } from "./GtmContainer";

describe("GtmContainer", () => {
  it("컨테이너 ID가 있으면 GTM 스크립트와 noscript iframe을 렌더링한다", () => {
    const markup = renderToStaticMarkup(
      <>
        <GtmHeadScript containerId="GTM-NQ3SJL2W" />
        <GtmBodyNoscript containerId="GTM-NQ3SJL2W" />
      </>,
    );

    expect(markup).toContain("GTM-NQ3SJL2W");
    expect(markup).toContain("gtm.js");
    expect(markup).toContain(
      'src="https://www.googletagmanager.com/ns.html?id=GTM-NQ3SJL2W"',
    );
  });

  it("컨테이너 ID가 비어 있으면 GTM 마크업을 렌더링하지 않는다", () => {
    const markup = renderToStaticMarkup(
      <>
        <GtmHeadScript containerId="  " />
        <GtmBodyNoscript containerId="" />
      </>,
    );

    expect(markup).toBe("");
  });
});
