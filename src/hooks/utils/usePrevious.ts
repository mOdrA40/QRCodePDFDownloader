/**
 * usePrevious Hook
 * Returns the previous value of a state or prop
 */

import { useEffect, useRef } from "react";

/**
 * Hook that returns the previous value
 * @param value - The current value
 * @returns The previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
