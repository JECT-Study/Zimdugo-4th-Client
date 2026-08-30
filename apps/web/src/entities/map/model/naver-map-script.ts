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
