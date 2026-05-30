import React, { useState } from "react";
import { TourContext } from "./TourContext";

interface TourProviderProps {
  children: React.ReactNode;
}

/**
 * Optional context provider that coordinates multiple tours running in the
 * same app — ensures only one tour is active at a time and exposes the
 * active tour id to any component in the tree.
 *
 * Wrap your app root with `<TourProvider>` when you have more than one tour.
 * Single-tour setups work fine without it.
 */
export function TourProvider({ children }: TourProviderProps) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);

  return (
    <TourContext.Provider value={{ activeTourId, setActiveTourId }}>
      {children}
    </TourContext.Provider>
  );
}
