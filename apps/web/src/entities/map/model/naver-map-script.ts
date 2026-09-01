/**
 * maps.js 스크립트 URL 을 만든다.
 *
 * 서브모듈 목록의 쉼표를 인코딩하면 안 된다. SDK 는 쿼리 문자열을 디코드하지
 * 않고 그대로 `,` 로 나누므로, `submodules=geocoder%2Cgl` 을 이름 하나로 읽어
 * `maps-geocoder%2Cgl.js` 라는 없는 파일을 부른다. 그러면 지도는 뜨지만
 * geocoder 도 gl 도 실리지 않는다.
 */

const NAVER_MAP_SCRIPT_BASE_URL =
  "https://openapi.map.naver.com/openapi/v3/maps.js";

export const getNaverMapScriptSrc = ({
  clientId,
  language,
  submodules,
}: {
  clientId: string;
  language?: string;
  submodules: readonly string[];
}) => {
  const params = new URLSearchParams({ ncpKeyId: clientId });

  if (language) {
    params.set("language", language);
  }

  if (submodules.length > 0) {
    params.set("submodules", submodules.join(","));
  }

  return `${NAVER_MAP_SCRIPT_BASE_URL}?${params.toString().replaceAll("%2C", ",")}`;
};

const getScriptSubmodules = (url: URL) => {
  const submodules = url.searchParams.get("submodules");

  return submodules ? submodules.split(",") : [];
};

/**
 * 이미 붙어 있는 maps.js 를 그대로 써도 되는지 본다.
 *
 * 필요한 서브모듈을 다 갖고 있으면 재사용한다. 없는 것을 요구하면 안 된다 —
 * gl 없이 실린 SDK 를 쓰면 customStyleId 가 조용히 무시된다. 반대로 더 많이
 * 실린 것은 문제가 되지 않는다.
 *
 * 문자열을 그대로 비교하면 WebGL 을 잃어 gl 을 빼고 다시 계산했을 때 같은
 * SDK 를 한 번 더 받는다. maps.js 를 두 번 실으면 window.naver.maps 가
 * 갈아끼워져 먼저 만든 지도가 함께 흔들린다.
 */
export const canReuseNaverMapScript = (
  activeSrc: string,
  requiredSrc: string,
) => {
  let activeUrl: URL;
  let requiredUrl: URL;

  try {
    activeUrl = new URL(activeSrc);
    requiredUrl = new URL(requiredSrc);
  } catch {
    return false;
  }

  if (activeUrl.origin !== requiredUrl.origin) return false;
  if (activeUrl.pathname !== requiredUrl.pathname) return false;

  for (const key of ["ncpKeyId", "language"]) {
    if (activeUrl.searchParams.get(key) !== requiredUrl.searchParams.get(key)) {
      return false;
    }
  }

  const activeSubmodules = new Set(getScriptSubmodules(activeUrl));

  return getScriptSubmodules(requiredUrl).every((submodule) =>
    activeSubmodules.has(submodule),
  );
};

const SDK_READY_TIMEOUT_MS = 5000;

/**
 * SDK 초기화가 끝날 때까지 기다린다.
 *
 * maps.js 의 onload 는 서브모듈이 실리기 전에 떨어진다. 그 시점에 지도를
 * 만들면 gl 서브모듈이 아직 없어 `glSupported()` 가 false 라, `gl: true` 를
 * 넘겨도 벡터가 아니라 래스터로 그려진다.
 */
export const waitForNaverMapSdkReady = () =>
  new Promise<void>((resolve) => {
    const maps = window.naver?.maps;

    if (!maps || maps.jsContentLoaded) {
      resolve();
      return;
    }

    let isSettled = false;
    const settle = () => {
      if (isSettled) return;
      isSettled = true;
      window.clearTimeout(timeoutId);
      resolve();
    };

    // 초기화가 끝나지 않아도 지도는 기본 스타일로 뜬다. 무한정 막지 않는다.
    const timeoutId = window.setTimeout(settle, SDK_READY_TIMEOUT_MS);
    const previousCallback = maps.onJSContentLoaded;

    maps.onJSContentLoaded = () => {
      previousCallback?.();
      settle();
    };
  });
