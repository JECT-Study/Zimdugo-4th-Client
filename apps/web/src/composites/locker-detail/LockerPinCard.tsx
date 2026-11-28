import { m } from "@repo/i18n";
import {
  IconDirections16,
  IconDistanceRoute24,
  IconNavigationClock24,
  IconStarFilled24,
  IconStarOutline24,
} from "@repo/ui/assets/icons";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
import { LockerRealtimeStatusCard } from "#/entities/locker/ui/realtime-availability";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import {
  actionButton,
  actions,
  anchor,
  card,
  errorRow,
  errorText,
  favoriteButton,
  header,
  meta,
  metaItem,
  primaryActionButton,
  realtime,
  retryButton,
  tail,
  title,
  titleColumn,
} from "./LockerPinCard.css.ts";

export interface LockerPinCardProps {
  locker: LockerDetailItem;
  /** 상세를 아직 받는 중이면 이름 자리 등을 자리표시로 둔다. */
  isLoading?: boolean;
  /** 상세를 받지 못했으면 자리표시 대신 오류와 다시 시도를 보여 준다. */
  isError?: boolean;
  onRetry?: () => void;
  /** 고른 핀이 겹친 핀을 피해 옮겨진 거리. 카드도 같은 만큼 옮겨 핀 위에 둔다. */
  offset?: { offsetX: number; offsetY: number } | null;
  canFavorite?: boolean;
  onFavoriteChange?: (locker: LockerDetailItem, next: boolean) => void;
  onNavigate?: (locker: LockerDetailItem) => void;
  onOpenDetail: () => void;
}

/**
 * 데스크톱에서 지도 핀을 눌렀을 때 핀 바로 위에 뜨는 요약 카드.
 *
 * 상세 패널을 열기 전에 지도 위에서 바로 훑어보는 자리다. 이름·거리·운영시간과 실시간
 * 남은 칸을 보여 주고, 길찾기·즐겨찾기는 여기서 바로 한다. 더 보려면 "자세히 보기" 로
 * 지금의 상세 패널을 연다. 주소는 바꾸지 않는다.
 */
export function LockerPinCard({
  locker,
  isLoading = false,
  isError = false,
  onRetry,
  offset,
  canFavorite = false,
  onFavoriteChange,
  onNavigate,
  onOpenDetail,
}: LockerPinCardProps) {
  const isFavorite = locker.isFavorite === true;
  const realtimeAvailability = locker.realtimeAvailability;
  const distanceText =
    locker.distanceLabel.trim() || m.locker_detail_distance_not_provided();

  const handleFavoritePress = () => {
    onFavoriteChange?.(locker, !isFavorite);
  };

  const handleNavigatePress = () => {
    onNavigate?.(locker);
  };

  return (
    <div
      className={anchor}
      style={
        offset
          ? { marginLeft: offset.offsetX, marginBottom: -offset.offsetY }
          : undefined
      }
      data-locker-pin-card=""
    >
      {/*
          실시간 카드는 요약 카드 안이 아니라 그 위에 얹는다. 모바일에서 시트 윗변 위에
          떠 있는 것과 같은 카드다.
        */}
      {!isLoading && realtimeAvailability?.isAvailable ? (
        <div className={realtime}>
          <LockerRealtimeStatusCard
            availability={realtimeAvailability}
            variant="floating"
          />
        </div>
      ) : null}
      <section
        className={card}
        aria-label={isLoading ? undefined : locker.title}
      >
        <div className={header}>
          <div className={titleColumn}>
            {isError ? (
              <div className={errorRow} role="alert">
                <span className={errorText}>{m.locker_pin_card_error()}</span>
                <button type="button" className={retryButton} onClick={onRetry}>
                  {m.locker_pin_card_retry()}
                </button>
              </div>
            ) : isLoading ? (
              <>
                <Skeleton
                  width="80%"
                  height={18}
                  borderRadius={6}
                  style={SKELETON_SURFACE_STYLE}
                />
                <Skeleton
                  width="56%"
                  height={14}
                  borderRadius={6}
                  style={SKELETON_SURFACE_STYLE}
                />
              </>
            ) : (
              <>
                <h2 className={title}>{locker.title}</h2>
                <div className={meta}>
                  <span className={metaItem}>
                    <IconDistanceRoute24 />
                    {distanceText}
                  </span>
                  {locker.operatingHoursLabel ? (
                    <span className={metaItem}>
                      <IconNavigationClock24 />
                      {locker.operatingHoursLabel}
                    </span>
                  ) : null}
                </div>
              </>
            )}
          </div>
          {canFavorite && !isLoading && !isError ? (
            <button
              type="button"
              className={favoriteButton}
              onClick={handleFavoritePress}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? m.search_favorite_remove()
                  : m.search_favorite_add()
              }
            >
              {isFavorite ? <IconStarFilled24 /> : <IconStarOutline24 />}
            </button>
          ) : null}
        </div>

        <div className={actions}>
          <button
            type="button"
            className={actionButton}
            onClick={handleNavigatePress}
            // 상세가 없으면 길찾기에 쓸 이름·주소가 없다. 자세히 보기는 상세 패널이
            // 자기 오류·다시 시도를 갖고 있어 그대로 연다.
            disabled={isLoading || isError}
          >
            <IconDirections16 />
            {m.locker_detail_navigate()}
          </button>
          <button
            type="button"
            className={[actionButton, primaryActionButton].join(" ")}
            onClick={onOpenDetail}
          >
            {m.locker_pin_card_view_detail()}
          </button>
        </div>
      </section>
      <div className={tail} aria-hidden="true" />
    </div>
  );
}
