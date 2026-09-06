interface ResolveMapAttachFocusOptions {
  /** URL 이 가리키는 보관함 번호. 상세를 열고 있지 않으면 `undefined`. */
  lockerId: number | undefined;
  /** 딥링크 상세 카메라를 이미 맞춘 보관함. 아직 없으면 `undefined`. */
  focusedLockerId: number | undefined;
  /**
   * 로더가 상세를 가져왔는지.
   *
   * 좌표가 있는지까지는 보지 않는다. 좌표가 비어 있으면 호출자가 기본 좌표로
   * 떨어뜨리는데, 그 판단은 이 함수보다 먼저부터 있던 것이라 여기서 바꾸지 않는다.
   */
  hasDetail: boolean;
  /** 지도가 없어 미뤄 둔 핀이 있는지. */
  hasPendingPin: boolean;
}

/**
 * 지도가 붙는 순간 카메라를 어디로 맞출지.
 *
 * - `"detail"` — 딥링크로 연 상세. 로더가 가져온 좌표로 맞춘다.
 * - `"pin"` — 지도가 없어 미뤄 둔 핀. 그 자리로 맞춘다.
 * - `null` — 맞출 곳이 없다. 초기 카메라가 이미 옳다.
 */
export type MapAttachFocus = "detail" | "pin" | null;

/**
 * 지도가 붙었을 때 딥링크가 가리키는 곳으로 카메라를 맞출지 판단한다.
 *
 * 판단이 둘 엮여 있어 따로 뺐다. 상세가 핀보다 앞선다는 것과, 같은 보관함은 한 번만
 * 맞춘다는 것이다.
 *
 * **같은 보관함을 한 번만 맞추는 이유**: 테마를 바꾸면 지도를 다시 만든다. 그때마다
 * 다시 맞추면 사용자가 옮겨 둔 위치를 덮어쓴다.
 *
 * 로더가 상세를 아직 못 가져왔으면 `"pin"` 으로 내려간다. 상세를 열고는 있지만 어디인지
 * 모르는 상태라, 미뤄 둔 핀이 있으면 그쪽이 더 나은 답이다.
 */
export const resolveMapAttachFocus = ({
  lockerId,
  focusedLockerId,
  hasDetail,
  hasPendingPin,
}: ResolveMapAttachFocusOptions): MapAttachFocus => {
  const isNewDeepLinkFocus =
    lockerId !== undefined && focusedLockerId !== lockerId;

  if (isNewDeepLinkFocus && hasDetail) {
    return "detail";
  }

  return hasPendingPin ? "pin" : null;
};
