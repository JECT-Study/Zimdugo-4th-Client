export const MIN_MAP_CONTAINER_DIMENSION_PX = 1;

export interface MapContainerSize {
  width: number;
  height: number;
}

export const getMapContainerSize = (element: HTMLElement): MapContainerSize => {
  const rect = element.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
};

export const hasUsableMapContainerSize = (size: MapContainerSize): boolean =>
  size.width >= MIN_MAP_CONTAINER_DIMENSION_PX &&
  size.height >= MIN_MAP_CONTAINER_DIMENSION_PX;

/**
 * flex 레이아웃 확정 전 0×0 init을 피하기 위해 rAF로 컨테이너 크기를 기다린다.
 * maxFrames 초과 시에도 마지막 측정값으로 진행한다.
 */
export const waitForUsableMapContainerSize = (
  element: HTMLElement,
  maxFrames = 10,
): Promise<MapContainerSize> =>
  new Promise((resolve) => {
    let frames = 0;

    const tick = () => {
      const size = getMapContainerSize(element);
      if (hasUsableMapContainerSize(size) || frames >= maxFrames) {
        resolve(size);
        return;
      }
      frames += 1;
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
