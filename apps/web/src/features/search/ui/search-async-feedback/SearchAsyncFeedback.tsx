import { m } from "@repo/i18n";
import { IconCaution24, IconNormalSearch24 } from "@repo/ui/tokens/icons";
import {
  helper,
  hint,
  iconSlot,
  retryButton,
  root,
  title,
} from "./SearchAsyncFeedback.css.ts";

export type SearchAsyncFeedbackVariant =
  | "suggest-min-length"
  | "suggest-empty"
  | "suggest-error"
  | "result-error";

export interface SearchAsyncFeedbackProps {
  variant: SearchAsyncFeedbackVariant;
  onRetry?: () => void;
}

export function SearchAsyncFeedback({
  variant,
  onRetry,
}: SearchAsyncFeedbackProps) {
  if (variant === "suggest-min-length") {
    return (
      <div className={root}>
        <p className={hint}>{m.search_suggest_min_length()}</p>
      </div>
    );
  }

  if (variant === "suggest-empty") {
    return (
      <div className={root}>
        <span className={iconSlot} aria-hidden="true">
          <IconNormalSearch24 />
        </span>
        <p className={title}>{m.search_suggest_empty()}</p>
      </div>
    );
  }

  const isSuggestError = variant === "suggest-error";

  return (
    <div className={root} role="alert">
      <span className={iconSlot} aria-hidden="true">
        <IconCaution24 state="error" />
      </span>
      <p className={title}>
        {isSuggestError
          ? m.search_suggest_error_title()
          : m.search_result_error_title()}
      </p>
      <p className={helper}>
        {isSuggestError
          ? m.search_suggest_error_helper()
          : m.search_result_error_helper()}
      </p>
      {onRetry ? (
        <button
          type="button"
          className={retryButton}
          onClick={onRetry}
          aria-label={m.map_error_retry_aria()}
        >
          {m.map_error_retry()}
        </button>
      ) : null}
    </div>
  );
}
