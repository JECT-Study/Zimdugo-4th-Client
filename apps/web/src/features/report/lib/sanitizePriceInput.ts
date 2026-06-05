/** 제보 가격 입력 상한 (제품 스펙). 최솟값·min≤max 등은 Zod/제출 검증. */
export const REPORT_PRICE_MAX = 100_000;

/**
 * 가격 Input onChange용. 표시는 천 단위 쉼표(toLocaleString).
 * 입력 단계: 비숫자 제거, 선행 0 제거, 최댓값 캡만 적용.
 */
export function formatPriceInput(
  value: string,
  max: number = REPORT_PRICE_MAX,
): string {
  let digits = value.replace(/[^0-9]/g, "");
  digits = digits.replace(/^0+/, "");
  if (!digits) return "";

  const numeric = Math.min(Number(digits), max);
  return numeric.toLocaleString();
}
