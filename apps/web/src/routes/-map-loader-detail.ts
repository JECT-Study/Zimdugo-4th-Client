interface LoaderDetail {
  latitude?: number | null;
  longitude?: number | null;
}

interface MatchWithLoaderData {
  loaderData?: unknown;
}

/**
 * 지도 레이아웃 아래에 있는 화면이 로더로 가져온 상세를 꺼낸다.
 *
 * 지도의 초기 카메라는 딥링크로 연 상세의 좌표를 봐야 하는데, 그 값을 가져오는 로더는
 * **자식 라우트**에 있다. 부모는 자식의 컨텍스트를 읽을 수 없지만, 라우터가 주는 매치
 * 목록에는 자식의 `loaderData` 가 들어 있다. 그래서 통로를 새로 내지 않고 여기서 꺼낸다.
 *
 * 뒤에서부터 찾는다. 목록은 루트에서 잎으로 늘어서 있고, 상세를 아는 것은 언제나 가장
 * 안쪽 화면이다. 형제 라우트가 생겨도(#215 의 1-6 에서 `/search` 가 온다) 지금 그려지는
 * 화면 하나만 매치에 들어오므로 이 규칙이 유지된다.
 */
export const pickMapLoaderDetail = (
  matches: readonly MatchWithLoaderData[],
): LoaderDetail | null => {
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const loaderData = matches[index]?.loaderData;
    if (loaderData == null || typeof loaderData !== "object") {
      continue;
    }

    if (!("detail" in loaderData)) {
      continue;
    }

    const { detail } = loaderData as { detail: unknown };
    // 로더는 못 찾았을 때 `{ detail: null }` 을 준다. 그것도 답이라 계속 찾지 않는다.
    return detail == null ? null : (detail as LoaderDetail);
  }

  return null;
};
