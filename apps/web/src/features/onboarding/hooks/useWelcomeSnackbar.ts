import { useCallback, useEffect, useState } from "react";
import {
  hasSeenWelcomeSnackbar,
  markWelcomeSnackbarAsSeen,
} from "../model/welcome-snackbar-storage";

export function useWelcomeSnackbar() {
  // 서버 렌더와 첫 클라이언트 렌더는 저장소를 읽지 않고 같은 상태로 시작한다.
  const [isOpen, setIsOpen] = useState(false);

  const dismiss = useCallback(() => {
    markWelcomeSnackbarAsSeen();
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setIsOpen(!hasSeenWelcomeSnackbar());
  }, []);

  return { isOpen, dismiss };
}
