/**
 * 라우터가 주소의 쿼리를 읽고 쓰는 방식.
 *
 * 값마다 JSON 으로 읽어 보고, 실패하면 문자열 그대로 둔다. 그래서 `?locker=1e3` 은
 * 문자열 `"1e3"` 이 아니라 숫자 `1000` 이 되고, 같은 키가 두 번 오면 뒤엣것이 이긴다.
 *
 * 라우터 밖에서 주소를 읽는 쪽(구 주소 리다이렉트 규칙 등)이 `URLSearchParams` 를
 * 직접 쓰면 같은 주소를 라우터와 다르게 해석한다. 그 차이가 곧 "홈은 여는데 규칙은
 * 못 알아보는 주소" 가 되므로, 해석을 여기 한 곳에 둔다.
 */
export const parseSearchString = (
  searchStr: string,
): Record<string, unknown> => {
  const params = new URLSearchParams(searchStr);
  const result: Record<string, unknown> = {};

  /*
   * forEach 는 중복 키를 모두 훑는다. 뒤엣것이 앞엣것을 덮으므로 마지막 값이 남는다.
   * `URLSearchParams.get` 은 반대로 첫 값을 준다.
   */
  params.forEach((value, key) => {
    try {
      result[key] = JSON.parse(value);
    } catch {
      result[key] = value;
    }
  });

  return result;
};

export const stringifySearchParams = (
  search: Record<string, unknown>,
): string => {
  const params = new URLSearchParams();

  Object.entries(search).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string") {
      params.set(key, value);
    } else {
      params.set(key, JSON.stringify(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
};
