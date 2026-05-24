import { useEffect } from "react";

export type Placement = string;

export function SyncPlacement({
  placement,
  setPlacement,
}: {
  placement: Placement;
  setPlacement: (placement: Placement) => void;
}) {
  useEffect(() => {
    setPlacement(placement);
  }, [placement, setPlacement]);
  return null;
}
