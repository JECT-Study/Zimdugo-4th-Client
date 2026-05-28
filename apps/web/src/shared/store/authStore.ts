import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

interface AuthState {
  accessToken: string | null;
  userId: number | null;
  email: string | null;
  provider: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: { accessToken: string; userId: number; email: string | null; provider?: string | null }) => void;
  clearAuth: () => void;
  getAccessToken: () => string | null;
}

// 브라우저 환경에서만 js-cookie를 사용하기 위한 커스텀 스토리지
const cookieStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return Cookies.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    Cookies.set(name, value, { expires: 7, path: "/" }); // 7일 유지
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    Cookies.remove(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      userId: null,
      email: null,
      provider: null,
      isAuthenticated: false,
      
      setAuth: (payload) => 
        set({ 
          accessToken: payload.accessToken, 
          userId: payload.userId, 
          email: payload.email, 
          provider: payload.provider || null,
          isAuthenticated: true 
        }),
        
      clearAuth: () => 
        set({ 
          accessToken: null, 
          userId: null, 
          email: null, 
          provider: null,
          isAuthenticated: false 
        }),
        
      getAccessToken: () => get().accessToken,
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => cookieStorage),
      // accessToken 등 민감한 정보는 제외하고 로그인 여부만 쿠키에 저장
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);
