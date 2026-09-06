import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * 지도를 얹는 화면들이 공유하는 레이아웃.
 *
 * 경로에 세그먼트를 더하지 않는 pathless 라우트다. `/` 는 여전히 `/` 이고, 프리렌더
 * 설정(`vite.config.ts` 의 `prerenderRoutes`)도 경로 문자열 기준이라 그대로 맞는다.
 *
 * 지금은 자식을 그대로 흘려보내기만 한다. 다음 조각에서 지도와 지도 컨트롤, 그리고
 * 그것들을 움직이는 상태가 이 자리로 올라오고, 자식은 시트만 갖는다(#215 의 1-3).
 * 경계를 먼저 세우고 옮기는 이유는, 라우트가 바뀌었을 때 깨지는 것과 코드를 옮겼을 때
 * 깨지는 것을 갈라서 보기 위해서다.
 *
 * `settings` · `notices` · `my` · `report` · `login` 은 지도를 쓰지 않으므로 이 아래에
 * 두지 않는다. 여기에 위치 추적이 올라오면 그 화면들에서도 GPS 가 켜진다.
 */
export const Route = createFileRoute("/_map")({
  component: MapLayout,
});

function MapLayout() {
  return <Outlet />;
}
