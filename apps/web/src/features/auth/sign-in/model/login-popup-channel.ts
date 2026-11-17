/**
 * 로그인 팝업과 그 팝업을 연 창 사이의 연락 통로.
 *
 * `window.opener.postMessage` 는 쓰지 않는다. 제공자 페이지(구글 등)를 거치는 동안
 * Cross-Origin-Opener-Policy 때문에 opener 가 끊길 수 있다. 같은 출처의 창끼리는
 * BroadcastChannel 이 opener 와 상관없이 닿는다.
 */

const LOGIN_POPUP_CHANNEL = "zimdugo:social-login-popup";

export interface LoginPopupResultMessage {
  type: "login-popup-result";
  popupId: string;
  code: string;
}

const isLoginPopupResultMessage = (
  data: unknown,
): data is LoginPopupResultMessage => {
  if (typeof data !== "object" || data == null) return false;
  const message = data as Partial<LoginPopupResultMessage>;

  return (
    message.type === "login-popup-result" &&
    typeof message.popupId === "string" &&
    typeof message.code === "string"
  );
};

export const isLoginPopupSupported = () =>
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined";

export const createLoginPopupId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export const postLoginPopupResult = (
  message: Omit<LoginPopupResultMessage, "type">,
) => {
  const channel = new BroadcastChannel(LOGIN_POPUP_CHANNEL);
  channel.postMessage({ type: "login-popup-result", ...message });
  channel.close();
};

export const subscribeLoginPopupResult = (
  listener: (message: LoginPopupResultMessage) => void,
) => {
  const channel = new BroadcastChannel(LOGIN_POPUP_CHANNEL);
  channel.onmessage = (event: MessageEvent) => {
    if (isLoginPopupResultMessage(event.data)) listener(event.data);
  };

  return () => channel.close();
};
