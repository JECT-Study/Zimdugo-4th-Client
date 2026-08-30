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
