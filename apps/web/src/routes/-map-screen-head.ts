import { languageTag, m } from "@repo/i18n";
import { notFound } from "@tanstack/react-router";
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
import { createLockerJsonLd } from "#/features/seo/model/locker-json-ld";
import { createLockerOgImageUrl } from "#/features/seo/model/locker-og-image-url";
import { getLockerDetail } from "#/shared/api/lockers";
import type { AppLocale } from "#/shared/i18n/locales";
import { isApiNotFoundError } from "#/shared/lib/api-error-status";
import { createLockerPath } from "#/shared/lib/map-path-url";
import { markResponseUncacheable } from "#/shared/lib/uncacheable-response";

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

/**
 * 상세 제목. 장소(역 출구·건물)를 알면 "{장소} 물품보관함" 을 앞에 둔다.
 *
 * "강남역 물품보관함" 처럼 지역명으로 찾는 검색어가 제목 앞쪽과 맞닿게 하려는 것이다.
 * 보관함 이름이 이미 장소 이름을 품고 있으면 같은 말이 두 번 나오므로 이름만 쓴다.
 */
export const createLockerDetailTitle = ({
  name,
  placeName,
  locale,
}: {
  name: string;
  placeName?: string;
  locale: AppLocale;
}) => {
  const place = placeName?.trim();
  if (!place || name.includes(place)) {
    return m.seo_locker_detail_title({ name }, { locale });
  }
  return m.seo_locker_detail_title_with_place({ place, name }, { locale });
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
  const title = createLockerDetailTitle({
    name,
    placeName: detail.placeName,
    locale,
  });
  const description = m.seo_locker_detail_description(
    { name, address, priceText },
    { locale },
  );
  const canonicalUrl = createLockerCanonicalUrl({
    lockerId: detail.lockerId,
    locale,
  });
  const ogImageUrl = createLockerOgImageUrl(detail.lockerId);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:secure_url", content: ogImageUrl },
      { property: "og:image:alt", content: name },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImageUrl },
      { name: "twitter:image:alt", content: name },
      {
        "script:ld+json": createLockerJsonLd({
          detail,
          url: canonicalUrl,
          imageUrl: ogImageUrl,
          description,
        }),
      },
    ],
    links: [
      { rel: "canonical", href: canonicalUrl },
      /*
       * 상세 주소가 id 만 쓰게 되어(#268) 로케일마다 주소를 바로 만들 수 있다.
       * 사이트맵의 hreflang 과 같은 짝을 페이지에도 선언한다.
       */
      ...createAlternateLinksForPathname(
        createLockerPath(String(detail.lockerId)),
      ),
    ],
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
 * API 가 없는 보관함이라고 답하면(404) `notFound()` 를 던져 문서도 404 로 답한다.
 * 200 으로 공통 머리를 내면 검색엔진이 soft 404 로 보고, 삭제된 보관함 주소가 색인에
 * 남는다.
 *
 * 그 밖의 이유로 못 가져오면(네트워크, 5xx) `{ detail: null }` 이다. 보관함이 있는지
 * 알 수 없으니 404 로 단정하지 않고, 화면이 클라이언트에서 다시 물어 채운다. 이
 * 대체 문서는 캐시하지 않는다(`markResponseUncacheable`).
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
    if (isApiNotFoundError(error)) {
      throw notFound();
    }
    console.error(`Failed to load locker ${lockerId} in route loader:`, error);
    // 공통 머리로 떨어진 문서다. CDN 에 담기면 API 가 복구돼도 10분 동안 이 문서가 나간다.
    markResponseUncacheable();
    return { detail: null };
  }
};
