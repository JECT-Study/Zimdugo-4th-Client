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
 *
 * `history.replace` 는 쓰지 않는다. 넘긴 state 와 상관없이 항목 키
 * (`key`, `__TSR_key`)를 새로 만들어, 그 키로 저장된 스크롤 위치를 잃는다.
 * 브라우저 주소만 기존 state 그대로 바꾸고, 라우터 히스토리에는 notify 로 알린다.
 * 주소가 화면을 그리기 전에 바뀌므로 paraglide 도 고친 로케일을 읽는다.
 */
export const keepDocumentLocaleOnTraverse = (
  history: RouterHistory,
  documentLocale: AppLocale,
  win: Window = window,
) =>
  history.subscribe(({ location, action }) => {
    if (!TRAVERSE_ACTION_TYPES.has(action.type)) return;

    const localizedHref = getDocumentLocaleHref(location.href, documentLocale);
    if (!localizedHref) return;

    win.history.replaceState(win.history.state, "", localizedHref);
    history.notify({ type: "REPLACE" });
    reannounceDocumentTitle(win.document);
  });

/** 제목 정리 때 공백처럼 잘려 나가지 않는 폭 없는 문자 */
const ZERO_WIDTH_SPACE = "​";

/**
 * Chrome 은 히스토리 항목마다 제목을 저장해 두고, 같은 문서 안에서 되감으면
 * 탭에 그 항목의 저장 제목을 띄운다. 이 항목은 예전 언어일 때 방문해서 예전 언어
 * 제목이 저장돼 있다.
 *
 * 다시 띄운 문서의 제목은 되감기 전후로 같은 문자열이라 바뀌지 않고, 바뀌지 않은
 * 제목은 Chrome 에 다시 전달되지 않는다. 같은 값을 다시 쓰거나 뒤에 공백을 붙였다
 * 떼는 것도 정리 후 같은 값이라 무시된다. 폭 없는 문자로 한 번 바꿨다 되돌려
 * 지금 제목을 이 항목에 다시 싣는다.
 */
const reannounceDocumentTitle = (doc: Document) => {
  const title = doc.title;
  if (!title) return;

  doc.title = `${title}${ZERO_WIDTH_SPACE}`;
  doc.title = title;
};
