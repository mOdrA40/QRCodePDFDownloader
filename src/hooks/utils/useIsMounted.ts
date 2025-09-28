/**
 * useIsMounted Hook
 * Tracks component mount status to prevent state updates on unmounted components
 */

import { useEffect, useState } from "react";

/**
 * Hook that tracks if component is mounted
 * @returns Boolean indicating if component is mounted
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return isMounted;
}
