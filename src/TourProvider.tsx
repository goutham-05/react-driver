import React, { useCallback, useMemo, useState } from "react";
import { TourContext } from "./TourContext";
import type { TourControls } from "./types";

interface TourProviderProps {
  children: React.ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);

  // The map holds the actual controls. A version counter drives re-renders of
  // useTourControls consumers when a tour is registered or unregistered.
  const [registry] = useState<Map<string, TourControls>>(() => new Map());
  const [registryVersion, setVersion] = useState(0);
  const bump = useCallback(() => setVersion(v => v + 1), []);

  const registerTour = useCallback((id: string, controls: TourControls) => {
    registry.set(id, controls);
    bump();
  }, [registry, bump]);

  const unregisterTour = useCallback((id: string) => {
    registry.delete(id);
    bump();
  }, [registry, bump]);

  const value = useMemo(() => ({
    activeTourId,
    setActiveTourId,
    registry,
    registerTour,
    unregisterTour,
  // registryVersion in deps so context object ref changes on register/unregister,
  // causing useTourControls consumers to re-render and pick up new registry entries.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [activeTourId, registryVersion, registerTour, unregisterTour]);

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}
TourProvider.displayName = 'TourProvider';
