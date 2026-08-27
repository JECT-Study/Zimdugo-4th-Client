import { m } from "@repo/i18n";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { IconCamera24 } from "@repo/ui/tokens/icons";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import {
  failureBox,
  failureText,
  IMAGE_HEIGHT_PX,
  image,
  imagePlaceholder,
  indicatorDot,
  indicatorDotActive,
  indicatorRow,
  item,
  itemButton,
  section,
  singleItem,
  strip,
} from "./LockerDetailImageStrip.css.ts";

export interface LockerDetailImageStripProps {
  images: string[];
  /** 두 번째 인자는 미리보기를 연 버튼이다. 닫을 때 포커스를 되돌리는 데 쓴다. */
  onOpenPreview?: (index: number, trigger: HTMLButtonElement) => void;
}

type ImageStatus = "loading" | "loaded" | "failed";

interface LockerDetailImageItemProps {
  imageUrl: string;
  index: number;
  totalCount: number;
  isSingle: boolean;
  shouldLoad: boolean;
  status: ImageStatus;
  onStatusChange: (imageUrl: string, status: ImageStatus) => void;
  onOpenPreview: (index: number, trigger: HTMLButtonElement) => void;
}

function LockerDetailImageItem({
  imageUrl,
  index,
  totalCount,
  isSingle,
  shouldLoad,
  status,
  onStatusChange,
  onOpenPreview,
}: LockerDetailImageItemProps) {
  const handleOpenPreview = (event: MouseEvent<HTMLButtonElement>) => {
    onOpenPreview(index, event.currentTarget);
  };

  const handleImageLoad = () => {
    onStatusChange(imageUrl, "loaded");
  };

  const handleImageError = () => {
    onStatusChange(imageUrl, "failed");
  };

  // 캐시된 이미지는 onLoad 가 붙기 전에 끝나 있을 수 있다.
  const handleImageRef = (node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) {
      onStatusChange(imageUrl, "loaded");
    }
  };

  const itemClassName = [item, isSingle ? singleItem : ""]
    .filter(Boolean)
    .join(" ");

  // 깨진 사진은 열어 봐야 볼 게 없다. 자리만 지키고 누를 수는 없게 둔다.
  if (status === "failed") {
    return (
      <li data-image-index={index} className={itemClassName}>
        <span className={failureBox}>
          <IconCamera24 />
          <span className={failureText}>
            {m.locker_detail_image_load_failed()}
          </span>
        </span>
      </li>
    );
  }

  return (
    <li data-image-index={index} className={itemClassName}>
      <button
        type="button"
        className={itemButton}
        onClick={handleOpenPreview}
        aria-label={m.locker_detail_image_item_aria({
          index: index + 1,
          total: totalCount,
        })}
      >
        {status === "loaded" ? null : (
          <Skeleton className={imagePlaceholder} height={IMAGE_HEIGHT_PX} />
        )}
        {shouldLoad ? (
          <img
            ref={handleImageRef}
            className={image}
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : null}
      </button>
    </li>
  );
}

/**
 * 상세 이미지 가로 스트립.
 *
 * 원본이 장당 수 MB라 화면에 닿지 않은 이미지는 네트워크로 받지 않는다.
 * `loading="lazy"` 만으로는 가로 스크롤 컨테이너에서 브라우저가 미리 받아 갈 수
 * 있어, 현재 장과 바로 다음 장까지만 `<img>` 를 붙이고 나머지는 자리만 잡아 둔다.
 */
export function LockerDetailImageStrip({
  images,
  onOpenPreview,
}: LockerDetailImageStripProps) {
  const stripRef = useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(0);
  /**
   * URL별 로드 상태.
   *
   * 실패해도 목록에서 빼지 않는다. 빼면 시트의 측정 높이가 바뀌고, 그 높이가
   * DraggableBottomSheet 의 key 에 들어가 있어 하위 트리가 리마운트된다. 목록이
   * 줄면 보고 있던 사진의 위치와 포커스 대상도 함께 어긋난다. 자리를 지키면
   * 이 문제들이 애초에 생기지 않는다.
   */
  const [statusByUrl, setStatusByUrl] = useState<
    ReadonlyMap<string, ImageStatus>
  >(() => new Map());

  const totalCount = images.length;
  const isSingle = totalCount === 1;
  /**
   * 관찰 대상을 다시 등록할지 판단하는 기준.
   *
   * key 가 URL 이라 목록이 같은 길이로 교체되면 li 노드는 새로 만들어진다.
   * 개수만 보면 effect 가 다시 돌지 않아 옵저버가 떨어져 나간 옛 노드만 붙들게 된다.
   */
  const imageListKey = images.join("|");

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(totalCount - 1, 0)));
  }, [totalCount]);

  useEffect(() => {
    setFurthestIndex((current) => Math.max(current, activeIndex));
  }, [activeIndex]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: imageListKey 는 재관찰 트리거다
  useEffect(() => {
    const stripElement = stripRef.current;
    if (
      !stripElement ||
      stripElement.children.length <= 1 ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) {
          return;
        }

        const index = Number(
          (visibleEntry.target as HTMLElement).dataset.imageIndex,
        );
        if (!Number.isNaN(index)) {
          setActiveIndex(index);
        }
      },
      { root: stripElement, threshold: [0.5, 0.75, 1] },
    );

    for (const child of stripElement.children) {
      observer.observe(child);
    }

    return () => observer.disconnect();
  }, [imageListKey]);

  if (totalCount === 0) {
    return null;
  }

  /**
   * 상태가 그대로면 같은 Map을 돌려준다.
   *
   * 새 Map을 만들면 상태가 매번 바뀐 것으로 보여 리렌더가 일어나고, 그때마다
   * img 의 ref 콜백이 다시 붙어 로드 완료를 또 알린다. 이 순환이 곧
   * `Maximum update depth exceeded` 다.
   */
  const handleStatusChange = (imageUrl: string, status: ImageStatus) => {
    setStatusByUrl((current) =>
      current.get(imageUrl) === status
        ? current
        : new Map(current).set(imageUrl, status),
    );
  };

  const handleOpenPreview = (index: number, trigger: HTMLButtonElement) => {
    onOpenPreview?.(index, trigger);
  };

  return (
    <div className={section}>
      <ul
        ref={stripRef}
        className={strip}
        aria-label={m.locker_detail_image_list_aria()}
      >
        {images.map((imageUrl, index) => (
          <LockerDetailImageItem
            key={imageUrl}
            imageUrl={imageUrl}
            index={index}
            totalCount={totalCount}
            isSingle={isSingle}
            shouldLoad={index <= furthestIndex + 1}
            status={statusByUrl.get(imageUrl) ?? "loading"}
            onStatusChange={handleStatusChange}
            onOpenPreview={handleOpenPreview}
          />
        ))}
      </ul>
      {isSingle ? null : (
        <div className={indicatorRow} aria-hidden="true">
          {images.map((imageUrl, index) => (
            <span
              key={imageUrl}
              className={[
                indicatorDot,
                index === activeIndex ? indicatorDotActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
