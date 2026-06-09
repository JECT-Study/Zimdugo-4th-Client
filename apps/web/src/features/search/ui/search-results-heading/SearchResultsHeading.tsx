import { m } from "@repo/i18n";
import {
  queryEmphasis,
  root,
  subtitle,
  text,
} from "./SearchResultsHeading.css.ts";

export interface SearchResultsHeadingProps {
  queryText: string;
  titleText?: string;
  resultCount?: number;
  subtitleText?: string;
  className?: string;
}

export function SearchResultsHeading({
  queryText,
  titleText,
  subtitleText,
  className,
}: SearchResultsHeadingProps) {
  const resolvedTitleText =
    titleText ?? m.search_result_title({ query: queryText });

  return (
    <div className={[root, className].filter(Boolean).join(" ")}>
      <p className={text}>
        <span className={queryEmphasis}>{resolvedTitleText}</span>
      </p>
      {subtitleText ? <p className={subtitle}>{subtitleText}</p> : null}
    </div>
  );
}
