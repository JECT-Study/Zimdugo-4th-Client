import { createServerOnlyFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

/**
 * 지금 그리는 문서 응답을 어떤 캐시에도 담지 않게 표시한다.
 *
 * 로더가 데이터를 못 가져와 대체 화면을 그릴 때 쓴다. 상태 코드는 200 이지만 내용은
 * 일시 오류의 결과라, CDN 에 담기면 API 가 복구된 뒤에도 그 문서가 계속 나간다.
 * `locker-detail-cdn-cache` 는 `no-store` 가 붙은 응답을 담지 않는다.
 *
 * 서버 렌더링 중에만 뜻이 있다. 클라이언트 번들에서는 몸체가 빠진다.
 */
export const markResponseUncacheable = createServerOnlyFn(() => {
  setResponseHeader("Cache-Control", "no-store");
});
