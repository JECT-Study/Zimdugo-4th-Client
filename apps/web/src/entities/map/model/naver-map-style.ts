/**
 * 지도 디자인툴(Maps 스타일 에디터) 스타일을 지도에 붙이는 규칙.
 *
 * 스타일은 스크립트 URL 파라미터가 아니라 GL 벡터 지도에서만 그려진다.
 * maps.js 를 부를 때 submodules 에 gl 을 싣고, 지도를 만들 때 MapOptions 에
 * gl: true 와 customStyleId 를 함께 넘겨야 한다. 둘 중 하나만 하면 네이버
 * 기본 스타일로 떨어진다.
 *
 * 라이트/다크는 스타일 에디터에서 각각 만들어 ID 를 따로 발급받는다.
 * 앱 전체 다크 모드는 아직 없어서 지금은 라이트만 실제로 쓰이고, 다크 ID 를
 * 채우고 colorScheme 을 넘기면 그대로 이어지도록만 열어 둔다.
 */

export const MAP_COLOR_SCHEMES = {
  Light: "light",
  Dark: "dark",
} as const;

export type MapColorScheme =
  (typeof MAP_COLOR_SCHEMES)[keyof typeof MAP_COLOR_SCHEMES];

export const DEFAULT_MAP_COLOR_SCHEME: MapColorScheme = MAP_COLOR_SCHEMES.Light;

export const NAVER_MAP_GL_SUBMODULE = "gl";

export type NaverMapCustomStyleIds = Record<MapColorScheme, string | undefined>;

export interface NaverMapStyleOptions {
  gl?: boolean;
  customStyleId?: string;
  background?: string;
}

/**
 * 타일이 오기 전에 깔아 둘 배경색. 다크 스타일에서 흰 화면이 한 번 번쩍이는
 * 것을 막는다.
 */
const MAP_BACKGROUND_COLORS: Record<MapColorScheme, string> = {
  light: "#ffffff",
  dark: "#111111",
};

export const NAVER_MAP_CUSTOM_STYLE_IDS: NaverMapCustomStyleIds = {
  light: import.meta.env.VITE_NAVER_MAP_CUSTOM_STYLE_ID_LIGHT,
  dark: import.meta.env.VITE_NAVER_MAP_CUSTOM_STYLE_ID_DARK,
};

// 빈 문자열을 그대로 넘기면 스타일을 못 찾아 지도가 뜨지 않는다.
const normalizeStyleId = (styleId?: string) => styleId?.trim() || undefined;

export const getNaverMapCustomStyleId = (
  colorScheme: MapColorScheme,
  styleIds: NaverMapCustomStyleIds = NAVER_MAP_CUSTOM_STYLE_IDS,
) => normalizeStyleId(styleIds[colorScheme]);

/**
 * 스타일 ID 가 하나라도 있으면 GL 서브모듈을 싣는다. 지금 쓰는 테마의 ID 만
 * 보고 정하면 테마를 바꿀 때 SDK 를 다시 불러야 한다.
 */
export const hasNaverMapCustomStyle = (
  styleIds: NaverMapCustomStyleIds = NAVER_MAP_CUSTOM_STYLE_IDS,
) => Object.values(styleIds).some((styleId) => normalizeStyleId(styleId));

export const withNaverMapStyleSubmodules = (
  submodules: readonly string[],
  styleIds: NaverMapCustomStyleIds = NAVER_MAP_CUSTOM_STYLE_IDS,
) => {
  if (
    !hasNaverMapCustomStyle(styleIds) ||
    submodules.includes(NAVER_MAP_GL_SUBMODULE)
  ) {
    return [...submodules];
  }

  return [...submodules, NAVER_MAP_GL_SUBMODULE];
};

/**
 * 지도를 만들 때 펼쳐 넣을 MapOptions 조각.
 *
 * 스타일 ID 가 없으면 빈 객체를 준다. gl 만 켜면 기본 지도까지 벡터로 바뀌어
 * 스타일과 무관하게 렌더링이 달라지므로 켜지 않는다.
 */
export const getNaverMapStyleOptions = (
  colorScheme: MapColorScheme = DEFAULT_MAP_COLOR_SCHEME,
  styleIds: NaverMapCustomStyleIds = NAVER_MAP_CUSTOM_STYLE_IDS,
): NaverMapStyleOptions => {
  const customStyleId = getNaverMapCustomStyleId(colorScheme, styleIds);
  if (!customStyleId) {
    return {};
  }

  return {
    gl: true,
    customStyleId,
    background: MAP_BACKGROUND_COLORS[colorScheme],
  };
};
