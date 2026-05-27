import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
      storage: createJSONStorage(() => localStorage),
      // accessToken 등 민감한 정보는 제외하고 로그인 여부만 저장
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);
