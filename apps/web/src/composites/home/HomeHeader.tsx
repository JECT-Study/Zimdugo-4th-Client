import { languageTag, m } from "@repo/i18n";
import {
  BrandTextLogoSmall,
  IconCheck24,
  IconFlagCircle24,
  IconHomeProfile32,
} from "@repo/ui/assets/icons";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { AnimatePresence, motion } from "motion/react";
import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import { ProfileImage } from "#/entities/user/ui/profile-image/ProfileImage";
import {
  APP_LANGUAGES,
  type AppLanguage,
  appLanguageLabelMap,
  normalizeLanguage,
  switchAppLanguage,
} from "#/shared/store/language";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import {
  type StyleReadyProbe,
  useStyleReadyProbe,
} from "#/shared/ui/useStyleReadyProbe";
import * as styles from "./HomeHeader.css";

export interface HomeHeaderProps {
  profileImageUrl?: string;
  onProfilePress: () => void;
}

const LANGUAGE_DROPDOWN_TRANSITION = {
  duration: 0.18,
  ease: "easeOut",
} as const;

const LANGUAGE_LABEL_TRANSITION = {
  duration: 0.12,
  ease: "easeOut",
} as const;

/**
 * CSS 청크가 붙기 전 첫 페인트에도 헤더가 제자리에 보이도록 하는 인라인 폴백.
 * 토큰이 아니라 리터럴을 쓰는 이유는 vanilla-extract 가 아직 없기 때문이다.
 */
const headerFallbackStyle: CSSProperties = {
  position: "absolute",
  top: "env(safe-area-inset-top, 0px)",
  left: 0,
  right: 0,
  // styles.header 의 calc(ui + 1) 과 같은 층. 검색 바(ui=20) 보다 위여야 한다.
  zIndex: 21,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  // maxWidth 는 넣지 않는다. 인라인 값은 미디어 쿼리를 표현할 수 없어서 430px 로
  // 고정되고, CSS 가 붙는 순간 태블릿 폭(480px)으로 튄다. 폭은 styles.header 가
  // 반응형으로 정하게 두고 폴백은 위치·높이만 잡는다. (HomeSearchBar 와 동일)
  height: "48px",
  margin: "0 auto",
  padding: "0 16px 0 30px",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
};

/** styles.headerAboveBottomSheet 와 같은 층. 바텀시트(1000) 바로 위. */
const HEADER_ABOVE_BOTTOM_SHEET_Z_INDEX = 1001;

const logoFallbackStyle: CSSProperties = {
  width: "78px",
  height: "16px",
  flexShrink: 0,
};

const actionsFallbackStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "12px",
  minWidth: 0,
};

const circleActionFallbackStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  flexShrink: 0,
};

/**
 * 프로브 엘리먼트는 width/height 를 인라인으로 0 으로 덮어쓰므로 그 두 값은 보지
 * 않는다. 헤더 클래스에서만 나오는 정렬과 좌측 패딩으로 판정한다.
 */
const isHomeHeaderStyleReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return (
    style.display === "flex" &&
    style.alignItems === "center" &&
    style.justifyContent === "space-between" &&
    style.paddingLeft === "30px"
  );
};

const HOME_HEADER_STYLE_PROBES: StyleReadyProbe[] = [
  {
    className: styles.header,
    isReady: isHomeHeaderStyleReady,
  },
];

/** 앱 크롬이라 세션당 한 번만 프로브한다. */
let hasHomeHeaderStyleResolved = false;

/** CSS 청크가 붙기 전에 헤더 자리를 잡아두는 스켈레톤. */
export function HomeHeaderSkeleton() {
  return (
    <header className={styles.header} style={headerFallbackStyle}>
      <HomeHeaderSkeletonContent />
    </header>
  );
}

function HomeHeaderSkeletonContent() {
  return (
    <>
      <Skeleton
        width={78}
        height={16}
        borderRadius={4}
        className={styles.logo}
        style={{ ...logoFallbackStyle, ...SKELETON_SURFACE_STYLE }}
      />
      <div
        className={styles.actions}
        style={actionsFallbackStyle}
        aria-hidden="true"
      >
        <Skeleton
          width={32}
          height={32}
          variant="circle"
          style={SKELETON_SURFACE_STYLE}
        />
        <Skeleton
          width={32}
          height={32}
          variant="circle"
          style={SKELETON_SURFACE_STYLE}
        />
      </div>
    </>
  );
}

export function HomeHeader({
  profileImageUrl = "",
  onProfilePress,
}: HomeHeaderProps) {
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);
  const languageOptionsId = useId();
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const [isLanguageOptionsOpen, setIsLanguageOptionsOpen] = useState(false);
  const currentLanguage = normalizeLanguage(languageTag()) ?? APP_LANGUAGES[0];
  const shouldProbeStyle = !hasHomeHeaderStyleResolved;
  const { isStyleReady, isStyleTimedOut } = useStyleReadyProbe({
    enabled: shouldProbeStyle,
    probes: HOME_HEADER_STYLE_PROBES,
  });
  const fallbackStyle = (style: CSSProperties) =>
    isStyleTimedOut ? style : undefined;
  // 폴백의 인라인 zIndex 는 headerAboveBottomSheet 클래스를 덮는다. 목록이 열려
  // 있으면 폴백에서도 바텀시트 위 층을 직접 써야 목록이 시트에 가리지 않는다.
  const headerStyle = fallbackStyle(
    isLanguageOptionsOpen
      ? { ...headerFallbackStyle, zIndex: HEADER_ABOVE_BOTTOM_SHEET_Z_INDEX }
      : headerFallbackStyle,
  );

  const handleToggleLanguage = () => {
    if (!isLanguageExpanded) {
      setIsLanguageExpanded(true);
      setIsLanguageOptionsOpen(true);
      return;
    }

    setIsLanguageOptionsOpen((isOpen) => !isOpen);
  };

  const handleSelectLanguage = (language: AppLanguage) => {
    setIsLanguageOptionsOpen(false);
    setIsLanguageExpanded(false);
    switchAppLanguage(language);
  };

  useEffect(() => {
    if (!isLanguageExpanded) return;

    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (!languageDropdownRef.current?.contains(event.target as Node)) {
        setIsLanguageOptionsOpen(false);
        setIsLanguageExpanded(false);
      }
    };

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLanguageOptionsOpen(false);
        setIsLanguageExpanded(false);
        // 닫기만 하면 포커스가 사라진 목록에 남아 키보드 사용자가 위치를 잃는다.
        languageTriggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isLanguageExpanded]);

  useEffect(() => {
    if (shouldProbeStyle && isStyleReady && !isStyleTimedOut) {
      hasHomeHeaderStyleResolved = true;
    }
  }, [shouldProbeStyle, isStyleReady, isStyleTimedOut]);

  if (!isStyleReady) {
    return <HomeHeaderSkeleton />;
  }

  return (
    <header
      className={[
        styles.header,
        isLanguageOptionsOpen ? styles.headerAboveBottomSheet : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={headerStyle}
    >
      {/* 로고 svg 는 width/height 속성을 갖고 있어 CSS 없이도 크기가 유지된다. */}
      <BrandTextLogoSmall className={styles.logo} />
      <div
        className={styles.actions}
        style={fallbackStyle(actionsFallbackStyle)}
      >
        <motion.div
          ref={languageDropdownRef}
          className={[
            styles.languageDropdown,
            isLanguageExpanded ? styles.languageDropdownExpanded : "",
          ]
            .filter(Boolean)
            .join(" ")}
          animate={{ width: isLanguageExpanded ? "max-content" : 32 }}
          transition={LANGUAGE_DROPDOWN_TRANSITION}
        >
          <motion.button
            ref={languageTriggerRef}
            type="button"
            className={styles.languageTrigger}
            aria-label={m.settings_language()}
            aria-haspopup="listbox"
            aria-expanded={isLanguageOptionsOpen}
            aria-controls={
              isLanguageOptionsOpen ? languageOptionsId : undefined
            }
            onClick={handleToggleLanguage}
            animate={{
              height: isLanguageExpanded ? 36 : 32,
              padding: isLanguageExpanded ? "2px 6px" : "4px",
              borderWidth: isLanguageExpanded ? 1 : 0,
            }}
            transition={LANGUAGE_DROPDOWN_TRANSITION}
          >
            {/*
              languageTag() 는 항상 지원 로케일을 돌려주므로 normalizeLanguage 가
              비는 경우가 없다. 32px 인 IconNormalGlobe32 는 24px 인 접힌 트리거
              콘텐츠 영역에서 잘리기만 하므로, 라벨과 같은 기준인 currentLanguage
              국기를 그린다.
            */}
            <IconFlagCircle24 country={currentLanguage} />
            <motion.span
              className={styles.languageTriggerLabel}
              animate={{
                opacity: isLanguageExpanded ? 1 : 0,
                x: isLanguageExpanded ? 0 : -4,
              }}
              transition={LANGUAGE_LABEL_TRANSITION}
            >
              {appLanguageLabelMap[currentLanguage]}
            </motion.span>
            <motion.span
              className={styles.languageChevron}
              aria-hidden
              animate={{
                opacity: isLanguageExpanded ? 1 : 0,
                x: isLanguageExpanded ? 0 : -4,
              }}
              transition={LANGUAGE_LABEL_TRANSITION}
            />
          </motion.button>
          <AnimatePresence>
            {isLanguageOptionsOpen ? (
              <motion.div
                id={languageOptionsId}
                className={styles.languageOptions}
                role="listbox"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={LANGUAGE_DROPDOWN_TRANSITION}
              >
                {APP_LANGUAGES.map((language) => {
                  const isCurrent = language === currentLanguage;
                  return (
                    <button
                      key={language}
                      type="button"
                      className={[
                        styles.languageOption,
                        isCurrent ? styles.languageOptionSelected : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      role="option"
                      aria-selected={isCurrent}
                      onClick={() => handleSelectLanguage(language)}
                    >
                      <IconFlagCircle24 country={language} />
                      <span className={styles.languageOptionText}>
                        {appLanguageLabelMap[language]}
                      </span>
                      <span className={styles.languageCheckIcon}>
                        {isCurrent ? <IconCheck24 /> : null}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
        <button
          type="button"
          className={styles.profileButton}
          style={fallbackStyle(circleActionFallbackStyle)}
          aria-label={m.my_profile_aria()}
          onClick={onProfilePress}
        >
          {profileImageUrl ? (
            <ProfileImage src={profileImageUrl} size={32} />
          ) : (
            <IconHomeProfile32 />
          )}
        </button>
      </div>
    </header>
  );
}
