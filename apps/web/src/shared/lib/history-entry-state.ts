/**
 * 히스토리 항목에 우리가 붙이는 표시.
 *
 * 컴포넌트 ref 로 들고 있으면 새로고침이나 재마운트에서 사라진다. 그러면 시트를
 * 닫을 때 쌓아 둔 칸을 되감지 못하고 현재 항목을 덮어써, 같은 화면이 하나씩 남고
 * 뒤로가기가 화면 변화 없이 그 중복을 헛돈다. 표시는 항목 자체에 남긴다.
 *
 * 라우터의 `HistoryState` 는 비어 있는 인터페이스라 보강해 쓰라고 열어 두었지만,
 * 이 패키지가 직접 의존이 아니라 보강이 붙지 않는다. 그래서 읽고 쓰는 자리를
 * 여기로 모은다.
 */

const DETAIL_LAYER_KEY = "zimdugoDetailLayer";

const hasFlag = (state: unknown, key: string) =>
  typeof state === "object" &&
  state !== null &&
  (state as Record<string, unknown>)[key] === true;

/** 상세 시트를 열며 이 항목을 쌓았는지. */
export const isDetailLayerEntry = (state: unknown) =>
  hasFlag(state, DETAIL_LAYER_KEY);

/** 상세 시트를 여는 이동에 얹을 표시. */
export const withDetailLayerFlag = (
  state: unknown,
): Record<string, unknown> => ({
  ...(typeof state === "object" && state !== null ? state : {}),
  [DETAIL_LAYER_KEY]: true,
});

/** 상세를 닫는 이동에서 표시를 걷어낸다. */
export const withoutDetailLayerFlag = (
  state: unknown,
): Record<string, unknown> => {
  const next = {
    ...(typeof state === "object" && state !== null ? state : {}),
  };
  delete (next as Record<string, unknown>)[DETAIL_LAYER_KEY];
  return next;
};
