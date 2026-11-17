import { parseLockerSearchParam } from "#/features/search/model/search-url-state";
import {
  parseSearchString,
  stringifySearchParams,
} from "#/shared/lib/search-serialization";

/**
 * 보관함 상세의 공개 주소(`/lockers/<slug>`)와 라우터가 다루는 주소(`/?locker=<slug>`)
 * 사이를 오가는 규칙.
 *
 * ## 왜 라우트가 아니라 주소 변환인가
 *
 * 상세는 아직 홈 화면 안의 상태다. 시트·검색 복귀·지도 카메라가 전부 `?locker=` 를
 * 보고 움직이고, 그 화면은 `_map.index.tsx` 한 컴포넌트다. 상세를 별도 라우트로
 * 떼면 라우트가 바뀌는 순간 그 컴포넌트가 다시 만들어져 화면 상태를 잃는다.
 *
 * 그래서 라우터 안쪽은 그대로 두고 **바깥에 보이는 주소만** 경로로 바꾼다. 라우터의
 * `rewrite` 가 들어올 때 경로를 쿼리로, 나갈 때 쿼리를 경로로 옮긴다. 로케일 접두사를
 * 같은 자리에서 다루고 있어 그 바로 안쪽에 겹친다.
 *
 * 이것으로 얻는 것은 **경로가 실제로 존재한다는 사실**이다. `/` 는 프리렌더된 정적
 * 파일이라 `?locker=` 가 붙어도 그 파일이 응답해 상세 메타가 한 번도 나가지 못했다.
 * `/lockers/<slug>` 에는 정적 파일이 없으므로 요청마다 서버가 그리고, 로더와 `head` 가
 * 그 보관함으로 돈다(#215 1-7).
 *
 * 화면을 라우트별로 나누는 일은 이 변환과 별개로 남는다. 그때 이 모듈은 라우트 정의로
 * 대체된다.
 */

/** 보관함 상세 주소의 경로 뿌리. */
export const LOCKER_ROUTE_BASE = "/lockers";

const LOCKER_PATH_PATTERN = /^\/lockers\/([^/]+)\/?$/;

/**
 * 경로 조각으로 그대로 써도 되는 슬러그 모양.
 *
 * 상세 판정(`parseLockerSearchParam`)은 하이픈 뒤를 무엇이든 받는다. `?locker=164-a/b`
 * 도 상세로 열린다는 뜻이다. 그 모양을 경로에 그대로 붙이면 `/lockers/164-a/b` 가
 * 되어 다른 라우트로 새어 나가므로, 정규 슬러그(`createLockerDeepLinkSlug` 가 내는
 * 문자·숫자·하이픈)만 통과시킨다.
 *
 * 통과하지 못하면 이름을 버리고 id 만 남긴다. 이름은 장식이고 정체성은 id 다.
 */
const CANONICAL_LOCKER_SLUG_PATTERN = /^\d+(?:-[\p{L}\p{N}-]*)?$/u;

/**
 * 경로에 실을 슬러그. 정규 모양이면 그대로, 아니면 id 만 남긴다.
 *
 * 상세로 인정하지 않는 값이면 null 이다.
 */
export const toLockerPathSlug = (raw: unknown): string | null => {
  const lockerId = parseLockerSearchParam(raw);
  if (lockerId === undefined) return null;

  const value = String(raw).trim();
  return CANONICAL_LOCKER_SLUG_PATTERN.test(value) ? value : String(lockerId);
};

/**
 * 보관함 상세의 경로. 로케일 접두사는 붙이지 않는다.
 *
 * 슬러그는 검증을 통과한 모양이라도 인코딩해서 붙인다. 검증이 나중에 느슨해져도
 * 경로가 새어 나가지 않게 하는 쪽이 싸다.
 */
export const createLockerPath = (slug: string): string =>
  `${LOCKER_ROUTE_BASE}/${encodeURIComponent(slug)}`;

/**
 * 공개 주소를 라우터가 다루는 주소로 바꾼다. 상세 경로가 아니면 그대로 돌려준다.
 *
 * 로케일 접두사를 걷어 낸 뒤의 주소를 받는다.
 *
 * 경로가 쿼리보다 앞선다. `/lockers/164?locker=999` 처럼 둘이 어긋나면 주소창에
 * 보이는 경로가 사용자가 연 화면이다.
 */
export const toInternalLockerUrl = (url: URL): URL => {
  const match = url.pathname.match(LOCKER_PATH_PATTERN);
  if (!match) return url;

  let slug: string;
  try {
    slug = decodeURIComponent(match[1]);
  } catch {
    return url;
  }

  // 상세로 인정하지 않는 값은 옮기지 않는다. 그대로 두면 없는 경로로 404 가 된다.
  if (parseLockerSearchParam(slug) === undefined) return url;

  const next = new URL(url.href);
  next.pathname = "/";
  next.search = stringifySearchParams({
    ...parseSearchString(url.search),
    locker: slug,
  });
  return next;
};

/**
 * 라우터가 다루는 주소를 공개 주소로 바꾼다. 홈에 붙은 상세가 아니면 그대로 돌려준다.
 *
 * 로케일 접두사를 붙이기 전의 주소를 받는다.
 */
export const toPublicLockerUrl = (url: URL): URL => {
  if (url.pathname !== "/") return url;

  const { locker, ...rest } = parseSearchString(url.search);
  const slug = toLockerPathSlug(locker);
  if (slug === null) return url;

  const next = new URL(url.href);
  next.pathname = createLockerPath(slug);
  next.search = stringifySearchParams(rest);
  return next;
};
