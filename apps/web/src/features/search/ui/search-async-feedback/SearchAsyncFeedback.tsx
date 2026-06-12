import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { IconNormalSearch24 } from "@repo/ui/tokens/icons";
import {
  errorActions,
  helper,
  hint,
  iconSlot,
  root,
  title,
} from "./SearchAsyncFeedback.css.ts";

export type SearchAsyncFeedbackVariant =
  | "suggest-invalid-format"
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
  if (variant === "suggest-invalid-format") {
    return (
      <div className={root}>
        <p className={hint}>{m.search_query_invalid_chars()}</p>
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
        <div className={errorActions}>
          <Button
            variant="filled"
            intent="primary"
            size="S"
            onPress={onRetry}
          >
            {m.map_error_retry()}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
