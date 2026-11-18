import { languageTag, m } from "@repo/i18n";
import { toLockerDetailItem } from "#/entities/locker/lib/locker-detail-adapters";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import { createLockerCanonicalUrl } from "#/features/search/lib/open-locker-deep-link";
import { DEFAULT_SEARCH_COORDINATES } from "#/features/search/model/useMapSheetSession";
import {
  createAlternateLinksForPathname,
  createLocalizedUrl,
  getSeoLocale,
  getSeoPathname,
} from "#/features/seo/model/localized-seo-head";
import { getLockerDetail } from "#/shared/api/lockers";

/**
 * 지도 화면 라우트들이 함께 쓰는 SEO 머리와 상세 로더.
 *
 * 홈·검색·장소·상세는 한 화면 컴포넌트를 공유하고(`_map._screen`), 라우트마다 다른 것은
 * 이 머리와 로더뿐이다.
 */

/** TanStack 의 head 컨텍스트에는 타입에 없는 `location` 이 실려 온다. */
type SeoHeadContext = {
  match: { pathname: string };
  location?: { publicHref?: string };
};

const resolveSeoLocale = (context: SeoHeadContext) => {
  const publicHref = context.location?.publicHref;
  return {
    pathname: getSeoPathname({ publicHref, pathname: context.match.pathname }),
    locale: getSeoLocale({
      publicHref,
      pathname: context.match.pathname,
      runtimeLocale: languageTag(),
    }),
  };
};

/**
 * 서비스 전체의 머리. 홈과 검색·장소 목록이 쓴다.
 *
 * `canonicalPathname` 을 주면 그 경로를 정본으로 선언한다. 검색 결과와 장소 목록은
 * 검색어·장소 조합마다 다른 주소가 생기지만 내용은 지도 위 목록이라, 따로 색인될
 * 이유가 없어 홈을 정본으로 둔다. 경로를 갖기 전(`/?q=`)에도 정본은 홈이었다.
 */
export const createGlobalMapScreenHead = (
  context: unknown,
  options: { canonicalPathname?: string } = {},
) => {
  const seoContext = context as SeoHeadContext;
  const resolved = resolveSeoLocale(seoContext);
  const pathname = options.canonicalPathname ?? resolved.pathname;
  const { locale } = resolved;

  const title = m.seo_global_title({}, { locale });
  const description = m.seo_global_description({}, { locale });
  const canonicalUrl = createLocalizedUrl({ pathname, locale });

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [
      { rel: "canonical", href: canonicalUrl },
      ...createAlternateLinksForPathname(pathname),
    ],
  };
};

/** 보관함 상세의 머리. 상세를 못 가져왔으면 서비스 전체의 머리로 떨어진다. */
export const createLockerDetailHead = (
  context: unknown,
  detail: LockerDetailItem | null | undefined,
) => {
  if (!detail) {
    return createGlobalMapScreenHead(context);
  }

  const { locale } = resolveSeoLocale(context as SeoHeadContext);
  const name = detail.title || "물품보관함";
  const address = detail.address || "";
  const minPrice = detail.minPrice;

  const priceText =
    minPrice != null
      ? m.seo_locker_detail_price_text(
          { price: minPrice.toLocaleString() },
          { locale },
        )
      : m.seo_locker_detail_price_unknown({}, { locale });
  const title = m.seo_locker_detail_title({ name }, { locale });
  const description = m.seo_locker_detail_description(
    { name, address, priceText },
    { locale },
  );
  const canonicalUrl = createLockerCanonicalUrl({
    lockerId: detail.lockerId,
    locale,
  });

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: canonicalUrl }],
  };
};

/**
 * 상세 경로의 보관함을 가져온다.
 *
 * 공개 데이터만 다룬다. 상세의 메타 태그를 서버에서 만들기 위한 로더이고, 여기서
 * 가져오는 값은 누구에게나 같다.
 *
 * ⚠️ 사용자별 데이터(즐겨찾기 여부, 알림 개수 등)를 여기에 넣으면 안 된다.
 * 서버는 요청자가 누구인지 모른다 — 액세스 토큰은 쿠키에 저장되지 않고,
 * 서버 가드가 읽는 `auth-storage` 는 클라이언트가 쓰는 위조 가능한 쿠키다.
 * 개인화가 필요하면 클라이언트에서 채운다.
 *
 * 못 가져오면 `{ detail: null }` 이다. 화면은 클라이언트에서 다시 물어 채운다.
 */
export const loadLockerDetail = async (
  lockerId: number,
): Promise<{ detail: LockerDetailItem | null }> => {
  try {
    const rawDetail = await getLockerDetail({
      lockerId,
      lat: DEFAULT_SEARCH_COORDINATES.lat,
      lng: DEFAULT_SEARCH_COORDINATES.lng,
    });
    return { detail: toLockerDetailItem(rawDetail) };
  } catch (error) {
    console.error(`Failed to load locker ${lockerId} in route loader:`, error);
    return { detail: null };
  }
};
