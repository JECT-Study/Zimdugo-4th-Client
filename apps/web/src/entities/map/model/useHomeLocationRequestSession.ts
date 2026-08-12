import { useEffect, useState } from "react";
import { hasRequestedHomeLocationInSession } from "./home-location-request-session";

export const useHasRequestedHomeLocationInSession = () => {
  const [hasRequestedHomeLocation, setHasRequestedHomeLocation] =
    useState(false);

  useEffect(() => {
    if (hasRequestedHomeLocationInSession()) {
      setHasRequestedHomeLocation(true);
    }
  }, []);

  return hasRequestedHomeLocation;
};
