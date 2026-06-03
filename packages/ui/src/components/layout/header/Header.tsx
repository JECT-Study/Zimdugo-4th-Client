import { Button } from "react-aria-components";
import {
  centerContainer,
  ghostBox,
  headerRoot,
  iconButton,
  logoBrand,
  logoHighlight,
  stepIndicator,
  titleText,
} from "./Header.css.ts";
import { IconChevronLeft13 } from "../../../tokens/icons/Icons";
export { HeaderSkeleton } from "./HeaderSkeleton";

export interface HeaderProps {
  /** 좌측 컴포넌트 구성 요소 (none 이면 표시 안 함, back 이면 뒤로가기 버튼) */
  leading?: "none" | "back";
  /** 화면 중앙 레이아웃 요소 지정 */
  titleType?: "logo" | "step" | "text" | "custom";
  /** titleType === "text" 일 때 렌더링될 문구 */
  title?: string;
  /** 현재 스텝 (titleType === "step" 시 활성) */
  stepCurrent?: number;
  /** 전체 스텝 수 (titleType === "step" 시 활성) */
  stepTotal?: number;
  /** 스텝 표시기 액티브 상태 (초록 배경여부) */
  stepState?: "default" | "active";
  /** 뒤로가기 액션 핸들러 */
  onBack?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function Header({
  leading = "none",
  titleType = "logo",
  title,
  stepCurrent = 1,
  stepTotal = 2,
  stepState = "default",
  onBack,
  className,
  children,
}: HeaderProps) {
  // 뒤로 가기가 필요 없고 titleType이 로고일 때는 좌측 정렬, 나머지 경우는 중앙 정렬
  const isCentered = leading === "back" || (titleType !== "logo" && titleType !== "custom");

  const renderContent = () => {
    switch (titleType) {
      case "logo":
        return (
          <>
            <span className={logoBrand}>Zim</span>
            <span className={logoHighlight}>DUGO</span>
          </>
        );
      case "step":
        return (
          <div className={stepIndicator({ state: stepState })}>
            {stepCurrent}/{stepTotal}
          </div>
        );
      case "text":
        return <span className={titleText}>{title}</span>;
      case "custom":
        return children;
      default:
        return null;
    }
  };

  return (
    <header className={[headerRoot, className].filter(Boolean).join(" ")}>
      {/* 1. Leading Area */}
      {leading === "back" ? (
        <Button
          className={iconButton}
          onPress={onBack}
          aria-label="뒤로가기"
        >
          <IconChevronLeft13 />
        </Button>
      ) : isCentered ? (
        // 중앙 정렬이 필요한 경우 좌측에 투명 박스를 주어 flex 공간을 1:1로 맞춤
        <div className={ghostBox} />
      ) : null}

      {/* 2. Center Content Area */}
      <div
        className={centerContainer({
          alignment: isCentered ? "center" : "left",
        })}
      >
        {renderContent()}
      </div>

      {/* 3. Right End Area (좌측 영역과 균형을 맞추기 위한 여백용 박스) */}
      {isCentered ? <div className={ghostBox} /> : null}
    </header>
  );
}
