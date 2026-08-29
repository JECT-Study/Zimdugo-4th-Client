import { m } from "@repo/i18n";
import { IconProfile22 } from "@repo/ui/icons";
import { useEffect, useState } from "react";
import { useUser } from "../../hooks/useUser.ts";
import * as styles from "./ProfileImage.css.ts";

export interface ProfileImageProps {
  /**
   * 사용자 ID. src가 없을 때 프로필 이미지 URL을 조회합니다.
   */
  /**
   * 이미지 소스 URL. 직접 주입 시 API 조회보다 우선합니다.
   */
  src?: string;
  /**
   * 이미지 대체 텍스트
   */
  alt?: string;
  /**
   * 프로필 이미지 크기 (기본값: 111)
   */
  size?: number | string;
  /** 이미지가 없을 때 원형 배경 톤 */
  placeholderTone?: "default" | "guest";
  /**
   * 커스텀 클래스
   */
  className?: string;
}

/**
 * 사용자 프로필 이미지 엔티티 컴포넌트.
 *
 * 이미지 URL 은 호출부가 넘긴다. 예전에는 userId 를 받아 직접 조회하려던
 * 흔적이 prop 으로 남아 있었는데, 넘기는 곳도 읽는 곳도 없어 지웠다.
 */
export function ProfileImage({
  src: initialSrc,
  alt,
  size = 111,
  placeholderTone = "default",
  className,
}: ProfileImageProps) {
  const [hasError, setHasError] = useState(false);
  const shouldFetchProfile = initialSrc == null;
  const { data: user } = useUser(shouldFetchProfile);
  const src = initialSrc ?? user?.profileImageUrl;

  const handleSetImageError = () => {
    setHasError(true);
  };

  // src 는 본문에서 읽지 않지만, 이미지가 바뀌면 이전 실패 상태를 지우려고
  // 일부러 넣은 트리거다. 빼면 다른 이미지로 바뀌어도 깨진 상태가 남는다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: src 는 재실행 트리거다
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const showImage = src && !hasError;
  const sizeValue = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      className={[
        styles.profileImageContainer,
        styles.profileImagePlaceholderTone[placeholderTone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: sizeValue,
        height: sizeValue,
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? m.my_profile_image_alt()}
          className={styles.profileImageContent}
          onError={handleSetImageError}
        />
      ) : (
        <IconProfile22 className={styles.profileImageIcon} />
      )}
    </div>
  );
}
