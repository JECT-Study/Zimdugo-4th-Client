/**
 * 지도가 화면에서 가려지는 영역.
 *
 * 지금까지 화면은 "시트가 하단에 차지하는 높이" 하나만 올려보냈다(`sheetVisibleHeightPx`).
 * 값 하나에 **세로 축이 전제로 박혀 있어서**, 지도 컨트롤 배치도 핀 선택 센터링도
 * 아래에서만 잰다.
 *
 * 경로 라우트 전환(#215)에서 지도는 레이아웃 라우트로 올라가고 화면은 `<Outlet>` 의
 * 자식이 된다. 그때 레이아웃이 쥐어야 하는 것은 "지도" 가 아니라 "지도 + 가려진
 * 영역" 이다. 자식이 무엇으로 가리는지(바텀시트인지 사이드 패널인지)를 레이아웃이
 * 알 필요는 없고, 얼마나 가리는지만 알면 된다.
 *
 * 그래서 값에 방향을 준다. 바텀시트는 `bottom` 을 채우고, 나중에 넓은 화면에서 좌측
 * 패널을 쓰면 같은 자리에 `left` 가 채워진다. 소비하는 쪽은 그대로 둔다.
 *
 * ```
 * { top: 0, right: 0, bottom: 191, left: 0 }   모바일 하프 시트
 * { top: 0, right: 0, bottom: 0, left: 420 }   좌측 패널
 * ```
 */
export interface MapInset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const EMPTY_MAP_INSET: MapInset = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

/**
 * 안 적은 변은 0 이다.
 *
 * 가리지 않는 것과 0px 가리는 것은 같은 뜻이라, 여기서는 null 을 두지 않는다.
 * 값 하나였을 때는 null 이 "밀어 올릴 단계가 아니다" 를 겸했는데, 그 뜻은 이제
 * 단계를 정하는 쪽에 있고 이 타입은 결과만 나른다.
 */
export const createMapInset = (inset: Partial<MapInset>): MapInset => ({
  ...EMPTY_MAP_INSET,
  ...inset,
});

/** 화면 하단을 이만큼 가린다. 재지 못했으면 가리지 않는 것으로 본다. */
export const createBottomMapInset = (
  bottomPx: number | null | undefined,
): MapInset =>
  createMapInset({ bottom: bottomPx != null && bottomPx > 0 ? bottomPx : 0 });

/**
 * 여러 겹이 가리는 영역을 하나로 모은다. 변마다 가장 많이 가리는 값을 남긴다.
 *
 * 겹치는 것들을 더하면 안 된다. 같은 변을 두 겹이 가려도 지도가 잃는 자리는
 * 더 깊은 쪽까지다.
 */
export const mergeMapInsets = (...insets: MapInset[]): MapInset =>
  insets.reduce<MapInset>(
    (merged, inset) => ({
      top: Math.max(merged.top, inset.top),
      right: Math.max(merged.right, inset.right),
      bottom: Math.max(merged.bottom, inset.bottom),
      left: Math.max(merged.left, inset.left),
    }),
    EMPTY_MAP_INSET,
  );
