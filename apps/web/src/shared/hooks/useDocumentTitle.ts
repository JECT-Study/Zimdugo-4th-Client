import { useEffect } from "react";

/**
 * 화면이 떠 있는 동안 문서 제목을 바꾸고, 떠나면 되돌린다. `null` 이면 손대지 않는다.
 *
 * 라우트의 `head` 로는 정할 수 없는 제목을 위한 것이다. 예를 들어 서버에서만 가져오는
 * 데이터로 머리를 만드는 라우트는 앱 안 이동에서 그 데이터가 없어, 화면이 클라이언트에서
 * 받은 값으로 제목을 채워야 한다.
 *
 * 되돌리기를 이 훅이 직접 한다. 라우터는 제목을 React 로 그리는데, 떠난 화면과 돌아온
 * 화면의 제목이 같으면(둘 다 서비스 공통 제목이면) 다시 쓰지 않아 바꾼 제목이 남는다.
 *
 * 반대로 라우터가 같은 화면 안의 이동(슬러그 정리 등)에서 머리를 다시 그리면 이 훅이
 * 바꾼 제목을 덮는다. 이동마다 바뀌는 값을 `reapplyKey` 로 넘기면 그때마다 다시 적용한다.
 */
export const useDocumentTitle = (
  title: string | null,
  reapplyKey?: string | number,
) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: reapplyKey 는 라우터가 머리를 다시 그린 뒤 제목을 되찾는 트리거다
  useEffect(() => {
    if (title === null || typeof document === "undefined") return;

    const previousTitle = document.title;
    document.title = title;

    return () => {
      // 그사이 다른 쪽이 제목을 바꿨으면 그 값을 덮지 않는다.
      if (document.title === title) {
        document.title = previousTitle;
      }
    };
  }, [title, reapplyKey]);
};
