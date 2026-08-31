import { useRouter } from "@tanstack/react-router";
import { type RefObject, useEffect, useRef } from "react";

export type HistoryActionType = "PUSH" | "REPLACE" | "BACK" | "FORWARD" | "GO";

/** 뒤로·앞으로처럼 사용자가 히스토리를 밟아 이동한 경우. */
export const isHistoryPop = (action: HistoryActionType | null) =>
  action === "BACK" || action === "FORWARD" || action === "GO";

/**
 * 마지막 히스토리 이동이 무엇이었는지 알려 준다.
 *
 * 홈은 시트·검색 컨텍스트를 URL 파라미터로 표현하므로, 뒤로가기로 복원된 URL 을
 * 보고 상태를 되살린다. 그 되살리는 과정에서 다시 URL 을 밀어 넣으면 뒤로가기가
 * 앞으로 한 칸 나아가 제자리를 맴돈다. 복원 중인지 구분해야 그 고리를 끊는다.
 */
export const useHistoryAction = (): RefObject<HistoryActionType | null> => {
  const router = useRouter();
  const actionRef = useRef<HistoryActionType | null>(null);

  useEffect(
    () =>
      router.history.subscribe(({ action }) => {
        actionRef.current = action.type as HistoryActionType;
      }),
    [router],
  );

  return actionRef;
};
