import { useSyncExternalStore } from "react";

const subscribeNothing = () => () => {};
const getIsHydratingOnClient = () => false;
const getIsHydratingOnServer = () => true;

/**
 * 서버 렌더와 그 마크업을 이어받는 하이드레이션 렌더에서만 true.
 *
 * useSyncExternalStore 는 하이드레이션 중에 서버 스냅샷을 쓰고, 끝나면 클라이언트
 * 스냅샷으로 한 번 더 그린다. 그래서 서버가 알 수 없는 값(브라우저 저장소, 로그인 쿠키)을
 * 쓰는 자리는 이 값이 true 인 동안 서버와 같은 모양을 그리면 하이드레이션이 갈리지 않는다.
 * 하이드레이션 뒤에 새로 마운트되는 컴포넌트(클라이언트 이동)에서는 처음부터 false 다.
 */
export const useIsHydrating = () =>
  useSyncExternalStore(
    subscribeNothing,
    getIsHydratingOnClient,
    getIsHydratingOnServer,
  );
