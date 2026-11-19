export const WELCOME_SNACKBAR_STORAGE_KEY = "zimdugo:welcome-snackbar";

export const hasSeenWelcomeSnackbar = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(WELCOME_SNACKBAR_STORAGE_KEY) === "seen";
  } catch {
    // 저장소 접근이 제한되면 안내를 숨길 근거가 없으므로 노출한다.
    return false;
  }
};

export const markWelcomeSnackbarAsSeen = (): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(WELCOME_SNACKBAR_STORAGE_KEY, "seen");
  } catch {
    // 저장에 실패해도 현재 화면에서는 닫힌 상태를 유지한다.
  }
};
