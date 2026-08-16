import { useEffect, useState } from "react";

export const useDelayedVisibility = (isActive: boolean, delayMs: number) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setIsVisible(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, isActive]);

  return isVisible;
};
