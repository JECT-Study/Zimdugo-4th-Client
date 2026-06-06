import { useCallback, useState } from "react";

export function useLocationPermissionPopup() {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = useCallback(() => setIsOpen(true), []);
  const closePopup = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    openPopup,
    closePopup,
  };
}
