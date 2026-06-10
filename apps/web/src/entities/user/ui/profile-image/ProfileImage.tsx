import { useState } from "react";
import { IconCamera24 } from "@repo/ui/tokens/icons";
import { useUser } from "../../hooks/useUser.ts";
import * as styles from "./ProfileImage.css.ts";

export interface ProfileImageProps {
  /**
   * 사용자 ID (엔티티 로직 결합 시 사용)
   */
  userId?: string;
  /**
   * 이미지 소스 URL (직접 주입 시 우선순위 높음)
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
 * userId가 제공되면 실시간으로 사용자 데이터를 조회(useQuery)하여 이미지를 표시합니다.
 */
export function ProfileImage({
  userId,
  src: initialSrc,
  alt = "프로필 이미지",
  size = 111,
  className,
}: ProfileImageProps) {
  const [hasError, setHasError] = useState(false);
  
  // FSD Entity Pattern: 엔티티 전용 훅(useQuery)을 사용하여 데이터와 로직을 결합
  const { data: user } = useUser(userId ?? "");
  
  const src = initialSrc ?? user?.profileImageUrl;

  const handleError = () => {
    setHasError(true);
  };

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
          alt={alt}
          className={styles.profileImageContent}
          onError={handleError}
        />
      ) : (
        <IconCamera24 className={styles.profileImageIcon} />
      )}
    </div>
  );
}
