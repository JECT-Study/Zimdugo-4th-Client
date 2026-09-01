/**
 * WebGL 을 실제로 쓸 수 있는지 본다.
 *
 * 네이버 지도 GL 은 WebGL 위에서만 그려진다. WebGL 이 없는 기기나 꺼 둔
 * 브라우저에서 gl 을 켜면 예외가 나지 않는다. 지도 객체는 만들어지고 idle 도
 * 떨어지는데 화면만 비어서, 에러로 잡을 곳이 없다. 그래서 지도를 만들기 전에
 * 여기서 걸러 래스터 지도로 떨어뜨린다(`naver-map-style.ts`).
 *
 * 판별을 통과하고도 깨지는 경우가 남는다. 소프트웨어 렌더러로 떨어졌거나,
 * 지도가 뜬 뒤 GPU 프로세스가 죽는 경우다. 그때는 캔버스가 `webglcontextlost`
 * 를 던지므로 `disableWebglSupport()` 로 판별 결과를 뒤집고, 구독자가 지도를
 * 래스터로 다시 만든다(`useWebglSupport.ts`).
 */

const WEBGL_CONTEXT_IDS = ["webgl2", "webgl"] as const;

let cachedSupport: boolean | undefined;
const listeners = new Set<() => void>();

const createProbeContext = (canvas: HTMLCanvasElement) => {
  for (const contextId of WEBGL_CONTEXT_IDS) {
    const context = canvas.getContext(contextId);
    if (context) {
      return context as WebGLRenderingContext | WebGL2RenderingContext;
    }
  }

  return null;
};

const probeWebglSupport = () => {
  const context = createProbeContext(document.createElement("canvas"));
  if (!context) return false;

  // 판별하려고 만든 컨텍스트는 바로 돌려준다. 동시에 열 수 있는 컨텍스트 수가
  // 모바일에서는 적어서, 쥐고 있으면 정작 지도가 쓸 몫을 뺏는다.
  context.getExtension("WEBGL_lose_context")?.loseContext();

  return true;
};

/**
 * 한 번 판별한 결과를 재사용한다. 지도와 위치 선택기가 각각 물어보고,
 * 테마가 바뀔 때마다 다시 물어본다.
 */
export const detectWebglSupport = () => {
  if (cachedSupport !== undefined) return cachedSupport;

  // 서버에는 캔버스가 없다. 지도는 클라이언트에서만 만들어지므로 판별도 그때
  // 한다. 여기서 캐시에 넣으면 서버에서 본 값이 그대로 굳는다.
  if (typeof document === "undefined") return false;

  try {
    cachedSupport = probeWebglSupport();
  } catch {
    // 컨텍스트를 못 만들 때 null 대신 예외를 던지는 브라우저가 있다.
    cachedSupport = false;
  }

  return cachedSupport;
};

/**
 * WebGL 을 더는 쓸 수 없다고 표시한다. 되돌리지 않는다 — 한 번 잃은 컨텍스트가
 * 이 세션에서 다시 살아난다는 보장이 없고, 오갈수록 지도만 다시 만들어진다.
 */
export const disableWebglSupport = () => {
  if (cachedSupport === false) return;

  cachedSupport = false;
  for (const listener of listeners) {
    listener();
  }
};

export const subscribeWebglSupport = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
