import { useSyncExternalStore } from "react";

import { detectWebglSupport, subscribeWebglSupport } from "./webgl-support";

/**
 * WebGL 을 쓸 수 있는지를 렌더링에 이어 준다.
 *
 * 판별 결과는 모듈에 있지만, 컨텍스트를 잃어 뒤집혔을 때 지도를 다시 만들려면
 * React 가 그 변화를 알아야 한다.
 *
 * 서버에는 캔버스가 없어 판별할 수 없다. 없다고 보고 그리면 클라이언트에서
 * 판별이 끝난 뒤 지도만 다시 만들어진다. 지도는 어차피 클라이언트에서만
 * 만들어지므로 화면에 보이는 차이는 없다.
 */
export const useWebglSupport = () =>
  useSyncExternalStore(subscribeWebglSupport, detectWebglSupport, () => false);
