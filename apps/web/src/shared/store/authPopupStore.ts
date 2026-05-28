import { create } from "zustand";

interface AuthPopupState {
  isOpen: boolean;
  returnPath: string;
  openPopup: (returnPath?: string) => void;
  closePopup: () => void;
}

export const useAuthPopupStore = create<AuthPopupState>((set) => ({
  isOpen: false,
  returnPath: "/",
  openPopup: (returnPath = "/") => set({ isOpen: true, returnPath }),
  closePopup: () => set({ isOpen: false }),
}));
