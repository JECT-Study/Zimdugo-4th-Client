import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_NAVER_MAP_LANGUAGE,
  normalizeNaverMapLanguage,
  type NaverMapLanguage,
} from "./naver-map-language";

export type NaverMapSdkStatus = "idle" | "loading" | "ready" | "error";

export interface NaverMapProviderProps {
  children: ReactNode;
  clientId?: string;
  language?: string;
  submodules?: string[];
}

interface NaverMapContextValue {
  status: NaverMapSdkStatus;
  isReady: boolean;
  error: Error | null;
  language: NaverMapLanguage;
  maps: typeof naver.maps | null;
  reload: () => void;
}

const NAVER_MAP_SCRIPT_SELECTOR = 'script[data-naver-maps-sdk="true"]';
const NAVER_MAP_SCRIPT_DATA_KEY = "naverMapsSdk";
const NAVER_MAP_AUTH_BASE_URL = "https://oapi.map.naver.com/v3/auth";
const DEFAULT_SUBMODULES = ["geocoder"];

const NaverMapContext = createContext<NaverMapContextValue | null>(null);

const getScriptSrc = ({
  clientId,
  language,
  submodules,
}: {
  clientId: string;
  language: string;
  submodules: string[];
}) => {
  const params = new URLSearchParams({
    ncpKeyId: clientId,
    language,
  });

  if (submodules.length > 0) {
    params.set("submodules", submodules.join(","));
  }

  return `https://openapi.map.naver.com/openapi/v3/maps.js?${params.toString()}`;
};

const removeNaverMapScript = () => {
  const activeScript = document.querySelector<HTMLScriptElement>(
    NAVER_MAP_SCRIPT_SELECTOR,
  );
  activeScript?.remove();
};

const getNaverMapAuthUrl = ({
  callbackName,
  clientId,
}: {
  callbackName: string;
  clientId: string;
}) => {
  const params = new URLSearchParams({
    ncpKeyId: clientId,
    url: `${window.location.origin}${window.location.pathname}`,
    time: String(Date.now()),
    callback: callbackName,
  });

  return `${NAVER_MAP_AUTH_BASE_URL}?${params.toString()}`;
};

const verifyNaverMapAuth = async (clientId: string) => {
  if (typeof window === "undefined") return;

  await new Promise<void>((resolve, reject) => {
    const callbackName = `__zimdugo_naver_maps_auth_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
    const script = document.createElement("script");
    const cleanup = () => {
      delete (window as Record<string, unknown>)[callbackName];
      script.remove();
    };
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Naver Maps authentication request timed out."));
    }, 5000);

    (window as Record<string, unknown>)[callbackName] = () => {
      window.clearTimeout(timeoutId);
      cleanup();
      resolve();
    };

    script.async = true;
    script.src = getNaverMapAuthUrl({ callbackName, clientId });
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      cleanup();
      reject(
        new Error(
          "Naver Maps authentication failed. Check the Client ID and allowed service URL.",
        ),
      );
    };
    document.head.appendChild(script);
  });
};

const loadNaverMapSdk = async ({
  clientId,
  language,
  submodules,
}: {
  clientId: string;
  language: string;
  submodules: string[];
}) => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!clientId) {
    throw new Error("VITE_NAVER_MAP_CLIENT_ID is required.");
  }

  await verifyNaverMapAuth(clientId);

  const scriptSrc = getScriptSrc({ clientId, language, submodules });
  const activeScript = document.querySelector<HTMLScriptElement>(
    NAVER_MAP_SCRIPT_SELECTOR,
  );

  if (activeScript?.src === scriptSrc && window.naver?.maps) {
    return window.naver.maps;
  }

  removeNaverMapScript();
  delete window.naver;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.dataset[NAVER_MAP_SCRIPT_DATA_KEY] = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Naver Maps SDK."));
    document.head.appendChild(script);
  });

  return window.naver?.maps ?? null;
};

export function NaverMapProvider({
  children,
  clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID,
  language = DEFAULT_NAVER_MAP_LANGUAGE,
  submodules = DEFAULT_SUBMODULES,
}: NaverMapProviderProps) {
  const [status, setStatus] = useState<NaverMapSdkStatus>("idle");
  const [maps, setMaps] = useState<typeof naver.maps | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const naverMapLanguage = normalizeNaverMapLanguage(language);
  const submoduleKey = submodules.join(",");

  useEffect(() => {
    let isMounted = true;

    setStatus("loading");
    setError(null);

    loadNaverMapSdk({
      clientId,
      language: naverMapLanguage,
      submodules,
    })
      .then((loadedMaps) => {
        if (!isMounted) return;
        setMaps(loadedMaps);
        setStatus(loadedMaps ? "ready" : "error");
        if (!loadedMaps) {
          setError(
            new Error("Naver Maps SDK did not expose window.naver.maps."),
          );
        }
      })
      .catch((nextError) => {
        if (!isMounted) return;
        setMaps(null);
        setStatus("error");
        setError(
          nextError instanceof Error
            ? nextError
            : new Error("Unknown SDK error."),
        );
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, naverMapLanguage, submoduleKey, reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const value = useMemo<NaverMapContextValue>(
    () => ({
      status,
      isReady: status === "ready",
      error,
      language: naverMapLanguage,
      maps,
      reload,
    }),
    [error, maps, naverMapLanguage, reload, status],
  );

  return (
    <NaverMapContext.Provider value={value}>
      {children}
    </NaverMapContext.Provider>
  );
}

export function useNaverMapSdk() {
  const context = useContext(NaverMapContext);
  if (!context) {
    throw new Error("useNaverMapSdk must be used within NaverMapProvider.");
  }

  return context;
}
