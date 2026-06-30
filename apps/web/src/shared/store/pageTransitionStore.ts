import { create } from "zustand";

interface PageTransitionState {
  isTransitioning: boolean;
  startTransition: () => void;
  endTransition: () => void;
}

export const usePageTransitionStore = create<PageTransitionState>((set) => ({
  isTransitioning: false,
  startTransition: () => set({ isTransitioning: true }),
  endTransition: () => set({ isTransitioning: false }),
}));
