import { create } from "zustand";

interface LoginResultState {
  isOpen: boolean;
  type: "success" | "failure" | null;
  onCloseCallback?: () => void;
  open: (type: "success" | "failure", onCloseCallback?: () => void) => void;
  close: () => void;
  forceClose: () => void;
}

export const useLoginResultStore = create<LoginResultState>((set, get) => ({
  isOpen: false,
  type: null,
  onCloseCallback: undefined,
  open: (type, onCloseCallback) => set({ isOpen: true, type, onCloseCallback }),
  close: () => {
    const { onCloseCallback } = get();
    set({ isOpen: false, type: null, onCloseCallback: undefined });
    if (onCloseCallback) onCloseCallback();
  },
  forceClose: () => set({ isOpen: false, type: null, onCloseCallback: undefined }),
}));
