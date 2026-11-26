import { vars } from "@repo/ui/vars";
import { style } from "@vanilla-extract/css";

/**
 * 데스크톱 검색 패널. 검색 결과 목록과 필터가 같은 자리를 쓴다.
 *
 * 왼쪽 위 검색 카드(로고 줄 + 검색창)와 같은 자리·폭에서 화면 아래까지 이어지는 흰
 * 카드다. 윗부분은 검색 카드 몫이라 그 높이만큼 비우고, 검색 카드 바로 아래 층에
 * 둬서 두 카드가 한 장으로 보이게 한다. 검색 카드의 그림자는 패널이 떠 있는 동안
 * HomeSearchBar.css 가 걷는다.
 *
 * 데스크톱 플래그가 켜졌을 때만 렌더되므로(useIsDesktopLayout) 미디어 쿼리는 두지 않는다.
 */
export const desktopSearchPanel = style({
  position: "absolute",
  top: vars.layout.desktopInset,
  bottom: vars.layout.desktopInset,
  left: vars.layout.desktopInset,
  width: vars.layout.desktopPanelWidth,
  // 검색 카드 높이: 로고 줄 + 검색 입력(48) + 카드 아래 여백
  paddingTop: `calc(${vars.layout.desktopHeader} + 48px + ${vars.spacing[20]})`,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  borderRadius: vars.layout.desktopPanelRadius,
  backgroundColor: vars.color.bg.default,
  boxShadow: vars.shadow[2],
  overflow: "hidden",
  // 검색 카드(ui) 바로 아래, 지도 위.
  zIndex: `calc(${vars.zIndex.ui} - 1)`,
});
