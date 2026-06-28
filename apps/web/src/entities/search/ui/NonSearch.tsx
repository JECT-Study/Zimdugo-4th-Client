import { m } from "@repo/i18n";
import { IconNormalSearch24 } from "@repo/ui/tokens/icons";
import type { ReactNode } from "react";
import {
  description,
  inputTextDisplay,
  languageBlock,
  queryText,
  root,
  textSub,
  textTitle,
  title,
} from "./NonSearch.css.ts";

export interface NonSearchProps {
  query?: string;
  titleText?: string;
  descriptionText?: string;
  englishTitleText?: string;
  englishDescriptionText?: string;
  icon?: ReactNode;
  showEnglishSub?: boolean;
}

export function NonSearch({
  query,
  titleText,
  descriptionText,
  englishTitleText,
  englishDescriptionText,
  icon,
  showEnglishSub = true,
}: NonSearchProps) {
  const normalizedQuery = query?.trim();
  const primaryDescription =
    descriptionText ??
    (normalizedQuery
      ? `${m.non_search_for({ query: `“${normalizedQuery}”` })}\n${m.non_search_try()}`
      : m.non_search_try());
  const englishDescription = normalizedQuery
    ? `${m.non_search_for_en({ query: `“${normalizedQuery}”` })}\n${m.non_search_try_en()}`
    : m.non_search_try_en();
  const renderedIcon = icon ?? <IconNormalSearch24 />;

  return (
    <div className={root}>
      {renderedIcon}
      <div className={title}>
        <div className={languageBlock}>
          <p className={textTitle}>{titleText ?? m.non_search_title()}</p>
          <p className={[inputTextDisplay, textSub, description].join(" ")}>
            {primaryDescription}
          </p>
        </div>

        {showEnglishSub ? (
          <div className={languageBlock}>
            <p className={textTitle}>
              {englishTitleText ?? m.non_search_title_en()}
            </p>
            <p className={[inputTextDisplay, textSub, queryText].join(" ")}>
              {englishDescriptionText ?? englishDescription}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
