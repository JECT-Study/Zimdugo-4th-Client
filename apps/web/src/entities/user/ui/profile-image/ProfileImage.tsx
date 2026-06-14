import { m } from "@repo/i18n";
import { useEffect, useState } from "react";
import { IconCamera24 } from "@repo/ui/tokens/icons";
import { useUser } from "../../hooks/useUser.ts";
import * as styles from "./ProfileImage.css.ts";

export interface ProfileImageProps {
  /**
   * 사용자 ID. src가 없을 때 프로필 이미지 URL을 조회합니다.
   */
  userId?: number | null;
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
  /**
   * 커스텀 클래스
   */
  className?: string;
}

/**
 * 사용자 프로필 이미지 엔티티 컴포넌트.
 * userId가 제공되면 useUser로 프로필 이미지 URL을 조회합니다.
 */
export function ProfileImage({
  userId,
  src: initialSrc,
  alt,
  size = 111,
  className,
}: ProfileImageProps) {
  const [hasError, setHasError] = useState(false);
  const shouldFetchProfile = initialSrc == null;
  const { data: user } = useUser(shouldFetchProfile);
  const src = initialSrc ?? user?.profileImageUrl;

  const handleSetImageError = () => {
    setHasError(true);
  };

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const showImage = src && !hasError;
  const sizeValue = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      className={[styles.profileImageContainer, className]
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
        <IconCamera24 className={styles.profileImageIcon} />
      )}
    </div>
  );
}
