import { SITE_ORIGIN } from "#/shared/lib/site-url";

/**
 * 상세 OG 이미지의 판(版).
 *
 * 카카오톡·노션 같은 미리보기 서비스는 이미지를 주소 기준으로 오래 캐시한다. 페이지를
 * 다시 읽어도 이미지 주소가 같으면 예전에 받아 둔 그림을 그대로 쓴다. 지도 이미지가
 * 기본 이미지로 302 되던 때(#277 이전) 받아 간 결과가 남아 있어, 고친 뒤에도 기본
 * 이미지가 보였다.
 *
 * 그림이 만들어지는 방식이 바뀌면 이 값을 올려 새 주소로 받아 가게 한다. 서버 핸들러는
 * 쿼리를 보지 않으므로 값만 바꾸면 된다.
 */
const LOCKER_OG_IMAGE_VERSION = "2";

export const createLockerOgImageUrl = (lockerId: number): string => {
  const url = new URL(`/og/lockers/${lockerId}/map.png`, SITE_ORIGIN);
  url.searchParams.set("v", LOCKER_OG_IMAGE_VERSION);
  return url.toString();
};
