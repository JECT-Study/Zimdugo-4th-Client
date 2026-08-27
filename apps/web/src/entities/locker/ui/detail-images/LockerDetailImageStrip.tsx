import { m } from "@repo/i18n";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { useEffect, useRef, useState } from "react";
import {
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
  /** 실패한 이미지를 걸러낸 목록과 그 안에서의 위치를 함께 넘긴다. */
  onOpenPreview?: (images: string[], index: number) => void;
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
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [loadedUrls, setLoadedUrls] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  // 실패한 이미지는 없는 이미지로 취급한다. 전부 실패하면 섹션째 사라진다.
  const visibleImages = images.filter((imageUrl) => !failedUrls.has(imageUrl));
  const totalCount = visibleImages.length;
  const isSingle = totalCount === 1;

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(totalCount - 1, 0)));
  }, [totalCount]);

  useEffect(() => {
    setFurthestIndex((current) => Math.max(current, activeIndex));
  }, [activeIndex]);

  useEffect(() => {
    const stripElement = stripRef.current;
    if (
      !stripElement ||
      totalCount <= 1 ||
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
  }, [totalCount]);

  if (totalCount === 0) {
    return null;
  }

  const handleImageError = (imageUrl: string) => {
    setFailedUrls((current) => new Set(current).add(imageUrl));
  };

  const handleImageLoad = (imageUrl: string) => {
    setLoadedUrls((current) => new Set(current).add(imageUrl));
  };

  return (
    <div className={section}>
      <ul
        ref={stripRef}
        className={strip}
        aria-label={m.locker_detail_image_list_aria()}
      >
        {visibleImages.map((imageUrl, index) => {
          const shouldLoad = index <= furthestIndex + 1;
          const isLoaded = loadedUrls.has(imageUrl);

          return (
            <li
              key={imageUrl}
              data-image-index={index}
              className={[item, isSingle ? singleItem : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className={itemButton}
                onClick={() => onOpenPreview?.(visibleImages, index)}
                aria-label={m.locker_detail_image_item_aria({
                  index: index + 1,
                  total: totalCount,
                })}
              >
                {isLoaded ? null : (
                  <Skeleton
                    className={imagePlaceholder}
                    height={IMAGE_HEIGHT_PX}
                  />
                )}
                {shouldLoad ? (
                  <img
                    ref={(node) => {
                      // 캐시된 이미지는 onLoad 가 붙기 전에 끝나 있을 수 있다.
                      if (node?.complete && node.naturalWidth > 0) {
                        handleImageLoad(imageUrl);
                      }
                    }}
                    className={image}
                    src={imageUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onLoad={() => handleImageLoad(imageUrl)}
                    onError={() => handleImageError(imageUrl)}
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {isSingle ? null : (
        <div className={indicatorRow} aria-hidden="true">
          {visibleImages.map((imageUrl, index) => (
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
