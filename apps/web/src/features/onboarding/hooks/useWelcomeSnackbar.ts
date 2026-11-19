import { useCallback, useEffect, useState } from "react";
import {
  hasSeenWelcomeSnackbar,
  markWelcomeSnackbarAsSeen,
} from "../model/welcome-snackbar-storage";

/** 첫 방문 안내가 스스로 사라지기까지의 시간 */
export const WELCOME_SNACKBAR_DURATION_MS = 6000;

/**
 * 첫 방문 안내의 노출 상태.
 *
 * `canShow` 는 지금 화면이 안내를 띄워도 되는 상태인지다(시트·검색·팝업이 없는
 * 홈). 처음 실제로 보인 순간 본 것으로 기록하므로, 닫지 않고 지나쳐도 다음
 * 방문에는 다시 뜨지 않는다.
 */
export function useWelcomeSnackbar(canShow: boolean) {
  // 서버 렌더와 첫 클라이언트 렌더는 저장소를 읽지 않고 같은 상태로 시작한다.
  const [isOpen, setIsOpen] = useState(false);
  const isVisible = isOpen && canShow;

  const dismiss = useCallback(() => {
    markWelcomeSnackbarAsSeen();
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setIsOpen(!hasSeenWelcomeSnackbar());
  }, []);

  /*
   * 보이는 동안에만 시간을 잰다. 시트나 팝업에 가려 잠시 내려가면 다시 보일 때
   * 처음부터 센다. 가려진 사이에 시간이 다 가면 사용자는 안내를 못 본다.
   */
  useEffect(() => {
    if (!isVisible) return;

    markWelcomeSnackbarAsSeen();
    const timer = window.setTimeout(() => {
      setIsOpen(false);
    }, WELCOME_SNACKBAR_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [isVisible]);

  return { isVisible, dismiss };
}
