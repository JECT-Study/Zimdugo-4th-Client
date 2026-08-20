import { languageTag, m } from "@repo/i18n";
import {
  BrandTextLogoSmall,
  IconCheck24,
  IconFlagCircle24,
  IconHomeProfile32,
  IconNormalGlobe32,
} from "@repo/ui/tokens/icons";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ProfileImage } from "#/entities/user/ui/profile-image/ProfileImage";
import {
  APP_LANGUAGES,
  type AppLanguage,
  appLanguageLabelMap,
  normalizeLanguage,
  switchAppLanguage,
} from "#/shared/store/language";
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

export function HomeHeader({
  profileImageUrl = "",
  onProfilePress,
}: HomeHeaderProps) {
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const [isLanguageOptionsOpen, setIsLanguageOptionsOpen] = useState(false);
  const normalizedLanguage = normalizeLanguage(languageTag());
  const currentLanguage = normalizedLanguage ?? APP_LANGUAGES[0];

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
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isLanguageExpanded]);

  return (
    <header className={styles.header}>
      <BrandTextLogoSmall className={styles.logo} />
      <div className={styles.actions}>
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
            type="button"
            className={styles.languageTrigger}
            aria-label={m.settings_language()}
            aria-expanded={isLanguageOptionsOpen}
            onClick={handleToggleLanguage}
            animate={{
              height: isLanguageExpanded ? 36 : 32,
              padding: isLanguageExpanded ? "2px 6px" : "4px",
              borderWidth: isLanguageExpanded ? 1 : 0,
            }}
            transition={LANGUAGE_DROPDOWN_TRANSITION}
          >
            {normalizedLanguage ? (
              <IconFlagCircle24 country={normalizedLanguage} />
            ) : (
              <IconNormalGlobe32 />
            )}
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
