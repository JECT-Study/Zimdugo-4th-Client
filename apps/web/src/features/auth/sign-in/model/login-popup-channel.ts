/**
 * 로그인 팝업과 그 팝업을 연 창 사이의 연락 통로.
 *
 * `window.opener.postMessage` 는 쓰지 않는다. 제공자 페이지(구글 등)를 거치는 동안
 * Cross-Origin-Opener-Policy 때문에 opener 가 끊길 수 있다. 같은 출처의 창끼리는
 * BroadcastChannel 이 opener 와 상관없이 닿는다.
 *
 * 팝업은 결과를 보낸 뒤 원래 창의 수신 확인을 기다린다. 원래 창이 새로고침되거나
 * 로그인 화면을 떠나 받을 수 없으면 확인이 오지 않으므로, 팝업이 직접 마무리한다.
 */

const LOGIN_POPUP_CHANNEL = "zimdugo:social-login-popup";

/** 팝업이 원래 창의 수신 확인을 기다리는 시간. 같은 기기 안의 통신이라 넉넉하다. */
const LOGIN_POPUP_ACK_TIMEOUT_MS = 1_000;

export interface LoginPopupResult {
  popupId: string;
  code: string;
}

interface LoginPopupResultMessage extends LoginPopupResult {
  type: "login-popup-result";
}

interface LoginPopupAckMessage {
  type: "login-popup-ack";
  popupId: string;
}

const isResultMessage = (data: unknown): data is LoginPopupResultMessage => {
  if (typeof data !== "object" || data == null) return false;
  const message = data as Partial<LoginPopupResultMessage>;

  return (
    message.type === "login-popup-result" &&
    typeof message.popupId === "string" &&
    typeof message.code === "string"
  );
};

const isAckMessage = (data: unknown): data is LoginPopupAckMessage => {
  if (typeof data !== "object" || data == null) return false;
  const message = data as Partial<LoginPopupAckMessage>;

  return (
    message.type === "login-popup-ack" && typeof message.popupId === "string"
  );
};

export const isLoginPopupSupported = () =>
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined";

export const createLoginPopupId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/**
 * 팝업에서 결과를 보내고, 원래 창이 받았다고 확인하면 `true` 로 끝난다.
 * 시간 안에 확인이 없으면 `false` 다.
 */
export const handOffLoginPopupResult = (
  result: LoginPopupResult,
  { timeoutMs = LOGIN_POPUP_ACK_TIMEOUT_MS } = {},
) =>
  new Promise<boolean>((resolve) => {
    const channel = new BroadcastChannel(LOGIN_POPUP_CHANNEL);

    const finish = (isAcknowledged: boolean) => {
      window.clearTimeout(timer);
      channel.close();
      resolve(isAcknowledged);
    };

    const timer = window.setTimeout(() => finish(false), timeoutMs);

    channel.onmessage = (event: MessageEvent) => {
      if (isAckMessage(event.data) && event.data.popupId === result.popupId) {
        finish(true);
      }
    };

    channel.postMessage({
      type: "login-popup-result",
      ...result,
    } satisfies LoginPopupResultMessage);
  });

/**
 * 원래 창에서 팝업의 결과를 받는다.
 *
 * `listener` 가 `true` 를 돌려주면 이 창이 맡은 결과로 보고 팝업에 수신을 확인한다.
 * 확인을 받은 팝업은 닫힌다.
 */
export const subscribeLoginPopupResult = (
  listener: (result: LoginPopupResult) => boolean,
) => {
  const channel = new BroadcastChannel(LOGIN_POPUP_CHANNEL);
  channel.onmessage = (event: MessageEvent) => {
    if (!isResultMessage(event.data)) return;

    const { popupId, code } = event.data;
    if (!listener({ popupId, code })) return;

    channel.postMessage({
      type: "login-popup-ack",
      popupId,
    } satisfies LoginPopupAckMessage);
  };

  return () => channel.close();
};
