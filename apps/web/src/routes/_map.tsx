import { languageTag } from "@repo/i18n";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { NaverMapProvider, useMapColorScheme } from "#/entities/map";

/**
 * 지도를 얹는 화면들이 공유하는 레이아웃.
 *
 * 경로에 세그먼트를 더하지 않는 pathless 라우트다. `/` 는 여전히 `/` 이고, 프리렌더
 * 설정(`vite.config.ts` 의 `prerenderRoutes`)도 경로 문자열 기준이라 그대로 맞는다.
 *
 * `settings` · `notices` · `my` · `report` · `login` 은 지도를 쓰지 않으므로 이 아래에
 * 두지 않는다. 나중에 위치 추적이 이 자리로 올라오면 그 화면들에서도 GPS 가 켜진다.
 */
export const Route = createFileRoute("/_map")({
  component: MapLayout,
});

function MapLayout() {
  const { colorScheme } = useMapColorScheme();

  /*
   * SDK 는 레이아웃이 쥔다. 스크립트 로딩·인증·스타일 옵션은 어느 화면을 보고 있든
   * 같고, 화면에서 오는 값이 하나도 없다(#215 의 1-3 에서 지도가 올라올 자리).
   *
   * 지도 인스턴스와 마커는 아직 자식에 있다. 그쪽은 검색·선택 상태를 보므로 함께
   * 올라가야 하고, 그건 다음 조각이다. 자식이 `<Outlet />` 안에 있으므로 이 프로바이더
   * 아래에 놓여 `useNaverMapSdk` 는 그대로 동작한다.
   */
  return (
    <NaverMapProvider colorScheme={colorScheme} language={languageTag()}>
      <Outlet />
    </NaverMapProvider>
  );
}
