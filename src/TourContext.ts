import { createContext, useContext } from "react";
import type { TourContextValue } from "./types";

export const TourContext = createContext<TourContextValue | null>(null);

export function useTourContext(): TourContextValue | null {
  return useContext(TourContext);
}
