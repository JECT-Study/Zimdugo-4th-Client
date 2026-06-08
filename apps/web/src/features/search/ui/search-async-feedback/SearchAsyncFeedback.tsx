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

const messages = m as unknown as Record<string, (() => string) | undefined>;

const TEXT_FALLBACKS = {
  search_suggest_min_length: "검색어를 2글자 이상 입력해주세요.",
  search_suggest_empty: "일치하는 장소나 보관함이 없어요.",
  search_suggest_error_title: "자동완성을 불러오지 못했어요",
  search_suggest_error_helper: "네트워크 상태를 확인한 뒤 다시 시도해주세요.",
  search_result_error_title: "검색 결과를 불러오지 못했어요",
  search_result_error_helper: "네트워크 상태를 확인한 뒤 다시 시도해주세요.",
  map_error_retry: "다시 시도",
  map_error_retry_aria: "다시 시도",
} as const;

const getMessage = (key: keyof typeof TEXT_FALLBACKS) =>
  messages[key]?.() ?? TEXT_FALLBACKS[key];

export function SearchAsyncFeedback({
  variant,
  onRetry,
}: SearchAsyncFeedbackProps) {
  if (variant === "suggest-min-length") {
    return (
      <div className={root}>
        <p className={hint}>{getMessage("search_suggest_min_length")}</p>
      </div>
    );
  }

  if (variant === "suggest-empty") {
    return (
      <div className={root}>
        <span className={iconSlot} aria-hidden="true">
          <IconNormalSearch24 />
        </span>
        <p className={title}>{getMessage("search_suggest_empty")}</p>
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
        {getMessage(
          isSuggestError
            ? "search_suggest_error_title"
            : "search_result_error_title",
        )}
      </p>
      <p className={helper}>
        {getMessage(
          isSuggestError
            ? "search_suggest_error_helper"
            : "search_result_error_helper",
        )}
      </p>
      {onRetry ? (
        <button
          type="button"
          className={retryButton}
          onClick={onRetry}
          aria-label={getMessage("map_error_retry_aria")}
        >
          {getMessage("map_error_retry")}
        </button>
      ) : null}
    </div>
  );
}
