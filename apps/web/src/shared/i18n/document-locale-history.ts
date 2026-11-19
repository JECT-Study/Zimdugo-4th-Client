import type { RouterHistory } from "@tanstack/react-router";
import {
  type AppLocale,
  BASE_LOCALE,
  parsePathLocale,
} from "#/shared/i18n/locales";
import { getLocalizedHref } from "#/shared/store/language";

const TRAVERSE_ACTION_TYPES = new Set(["BACK", "FORWARD", "GO"]);

/**
 * 되감아 도착한 주소가 문서와 다른 로케일이면, 문서 로케일로 고친 주소를 돌려준다.
 * 같으면 고칠 것이 없으므로 null.
 */
export const getDocumentLocaleHref = (
  href: string,
  documentLocale: AppLocale,
): string | null => {
  const pathname = href.split(/[?#]/)[0] ?? "/";
  const hrefLocale = parsePathLocale(pathname) ?? BASE_LOCALE;

  if (hrefLocale === documentLocale) return null;

  return getLocalizedHref(href, documentLocale);
};

/**
 * 언어 전환은 현재 항목의 주소만 바꾸고 문서를 다시 띄운다. 그보다 앞선 항목은
 * 예전 로케일 주소(`/settings`, `/ja/settings` …)로 남는다.
 *
 * 브라우저는 다시 띄운 문서에서도 그 항목들로 같은 문서 안에서 되감는다. 서버의
 * 로케일 가드는 문서 요청이 없어 끼어들지 못하고, 로케일을 URL 에서 읽는
 * paraglide 는 예전 언어로 화면을 그린다. 고른 언어가 뒤로가기 한 번에 풀린다.
 *
 * 되감기로 도착한 항목만 지금 문서의 로케일 주소로 바꿔치운다. 새 항목을 밀지
 * 않으므로 히스토리 길이는 그대로다.
 */
export const keepDocumentLocaleOnTraverse = (
  history: RouterHistory,
  documentLocale: AppLocale,
) =>
  history.subscribe(({ location, action }) => {
    if (!TRAVERSE_ACTION_TYPES.has(action.type)) return;

    const localizedHref = getDocumentLocaleHref(location.href, documentLocale);
    if (!localizedHref) return;

    history.replace(localizedHref, location.state);
    // 화면을 그리기 전에 주소를 맞춰야 paraglide 가 고친 로케일을 읽는다.
    history.flush();
  });
