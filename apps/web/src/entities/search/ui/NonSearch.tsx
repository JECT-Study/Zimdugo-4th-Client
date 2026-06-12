import { m } from "@repo/i18n";
import { IconNormalSearch24 } from "@repo/ui/tokens/icons";
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
  showEnglishSub?: boolean;
}

export function NonSearch({
  query,
  titleText,
  descriptionText,
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

  return (
    <div className={root}>
      <IconNormalSearch24 />
      <div className={title}>
        <div className={languageBlock}>
          <p className={textTitle}>{titleText ?? m.non_search_title()}</p>
          <p className={[inputTextDisplay, textSub, description].join(" ")}>
            {primaryDescription}
          </p>
        </div>

        {showEnglishSub ? (
          <div className={languageBlock}>
            <p className={textTitle}>{m.non_search_title_en()}</p>
            <p className={[inputTextDisplay, textSub, queryText].join(" ")}>
              {englishDescription}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
