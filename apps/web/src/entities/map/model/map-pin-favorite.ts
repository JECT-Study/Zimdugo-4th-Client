import type { LockerPinItemResponse } from "#/shared/api/lockers";

/**
 * 서버가 알려준 즐겨찾기 위에 아직 서버에 닿지 않은 토글을 얹어 지금 보여줄 값을 정한다.
 *
 * 핀은 entities 라 즐겨찾기 세션(features)을 직접 볼 수 없다. 판단은 넘겨받는다.
 */
export type ResolvePinFavorite = (
  lockerId: number,
  serverIsFavorite: boolean | undefined,
) => boolean;

/**
 * 지도 핀에 즐겨찾기 상태를 덧입힌다.
 *
 * 목록과 상세는 이미 덧입히는데 핀만 빠져 있어, 즐겨찾기를 눌러도 목록의 별만 바뀌고
 * 지도 위 마커는 그대로였다.
 *
 * 장소 핀과 클러스터 핀은 보관함 하나를 가리키지 않으므로 건드리지 않는다. 클러스터는
 * 애초에 즐겨찾기 도안이 없어서, 줌아웃 상태에서는 덧입혀도 달라지는 게 없다.
 */
export const applyFavoriteOverlayToPins = (
  pins: LockerPinItemResponse[],
  resolveEffectiveFavorite: ResolvePinFavorite,
): LockerPinItemResponse[] =>
  pins.map((pin) =>
    pin.pinType === "LOCKER" && pin.lockerId != null
      ? {
          ...pin,
          isFavorite: resolveEffectiveFavorite(
            pin.lockerId,
            pin.isFavorite ?? undefined,
          ),
        }
      : pin,
  );
