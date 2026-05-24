import { skeletonBase, circle as circleStyle } from "./Skeleton.css.ts";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  minHeight?: string | number;
  borderRadius?: string | number;
  variant?: "rect" | "circle";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 고도화된 스켈레톤 컴포넌트.
 * Motion을 사용하여 부드러운 펄스 애니메이션을 제공하며, 디자인 시스템 토큰을 준수합니다.
 */
export function Skeleton({
  width,
  height,
  minHeight,
  borderRadius,
  variant = "rect",
  className,
  style: externalStyle,
}: SkeletonProps) {
  const isCircle = variant === "circle";

  return (
    <div
      className={[
        skeletonBase,
        isCircle ? circleStyle : "",
        className,
      ].filter(Boolean).join(" ")}
      style={{
        width: width ?? "100%",
        height: height ?? "1em",
        minHeight: minHeight ?? undefined,
        borderRadius: borderRadius ?? undefined,
        ...externalStyle,
      }}
      aria-hidden="true"
    />
  );
}
