type ApiBaseUrlEnv = {
  API_BASE_URL?: string;
  VITE_API_BASE_URL?: string;
};

interface ResolveApiBaseUrlOptions {
  isServer: boolean;
  env?: ApiBaseUrlEnv;
  clientBaseUrl?: string;
  reportWarning?: (warning: RuntimeConfigWarning) => void;
}

const EMPTY_BASE_URL = "";

export interface RuntimeConfigWarning {
  code: "api_base_url_missing" | "api_base_url_invalid";
  message: string;
  details?: Record<string, string>;
}

export const reportRuntimeConfigWarning = ({
  code,
  message,
  details,
}: RuntimeConfigWarning) => {
  console.warn("[runtime-config]", { code, message, details });
};

const normalizeProtocolSlashes = (value: string) => {
  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  return value.replace(/^(https?:)\/{2,}/i, "$1//");
};

export const normalizeApiBaseUrl = (rawBaseUrl: string): string | null => {
  const trimmedBaseUrl = rawBaseUrl.trim();
  if (!trimmedBaseUrl) return null;

  try {
    const url = new URL(normalizeProtocolSlashes(trimmedBaseUrl));
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
};

const createBaseUrlPreview = (rawBaseUrl: string) => {
  const trimmedBaseUrl = rawBaseUrl.trim();
  try {
    const url = new URL(normalizeProtocolSlashes(trimmedBaseUrl));
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString().slice(0, 120);
  } catch {
    return trimmedBaseUrl.replace(/\s+/g, " ").slice(0, 120);
  }
};

export const resolveApiBaseUrl = ({
  isServer,
  env,
  clientBaseUrl,
  reportWarning = reportRuntimeConfigWarning,
}: ResolveApiBaseUrlOptions): string => {
  const rawBaseUrl = isServer
    ? env?.VITE_API_BASE_URL || env?.API_BASE_URL
    : clientBaseUrl;

  if (!rawBaseUrl) {
    reportWarning({
      code: "api_base_url_missing",
      message:
        "API base URL is not defined. Falling back to relative API paths.",
    });
    return EMPTY_BASE_URL;
  }

  const normalizedBaseUrl = normalizeApiBaseUrl(rawBaseUrl);
  if (!normalizedBaseUrl) {
    reportWarning({
      code: "api_base_url_invalid",
      message: "Invalid API base URL. Falling back to relative API paths.",
      details: {
        valuePreview: createBaseUrlPreview(rawBaseUrl),
      },
    });
    return EMPTY_BASE_URL;
  }

  return normalizedBaseUrl;
};
