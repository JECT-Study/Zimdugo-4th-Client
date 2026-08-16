const HOME_LOCATION_REQUESTED_SESSION_KEY = "zimdugo:home-location-requested";

export const hasRequestedHomeLocationInSession = () => {
  if (typeof window === "undefined") return false;

  try {
    return (
      window.sessionStorage.getItem(HOME_LOCATION_REQUESTED_SESSION_KEY) ===
      "true"
    );
  } catch {
    return false;
  }
};

export const markHomeLocationRequestedInSession = () => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(HOME_LOCATION_REQUESTED_SESSION_KEY, "true");
  } catch {
    // 저장소 접근이 제한된 환경에서는 현재 마운트의 ref가 중복 요청을 방지한다.
  }
};

export const clearHomeLocationRequestedInSession = () => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(HOME_LOCATION_REQUESTED_SESSION_KEY);
  } catch {
    // 저장소 접근이 제한된 환경에서는 현재 마운트의 ref가 요청 상태를 관리한다.
  }
};
