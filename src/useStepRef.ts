import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * Register an element as a tour step target by attaching a stable
 * `data-tour-ref` attribute. Returns a `ref` to put on the element and a
 * `target` CSS selector string ready to use in `TourStep.target`.
 *
 * Refactor-safe — element IDs and class names can change freely without
 * breaking the tour.
 *
 * @example
 * const { ref, target } = useStepRef("save-button");
 *
 * <button ref={ref}>Save</button>
 *
 * // In the tour config:
 * { target, content: "Click here to save your work." }
 */
export function useStepRef<T extends HTMLElement = HTMLElement>(
  id: string
): { ref: RefObject<T | null>; target: string } {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.tourRef = id;
    return () => { if (el) delete el.dataset.tourRef; };
  }, [id]);

  return { ref, target: `[data-tour-ref="${id}"]` };
}
