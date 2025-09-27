/**
 * Hooks barrel export
 * Central export point for all custom hooks
 */

import * as React from "react";

// Files-related hooks (organized in files folder)
export {
  type FilesAuthState,
  useFilesAuth,
} from "./files";
// Profile-related hooks (organized in profile folder)
export {
  type AuthGuardState,
  type CopyState,
  useAuthGuard,
  useCopyToClipboard,
  useUserInitials,
} from "./profile";

// General hooks
export { useDebouncedDuplicateCheck, useDuplicateCheck } from "./useDuplicateCheck";
export { useFileHandler } from "./useFileHandler";
export {
  useAppSettings,
  useLocalStorage,
  useQRPresets,
} from "./useLocalStorage";
export { useQRGenerator } from "./useQRGenerator";
export { useUsageStats } from "./useUsageStats";

// Hook utilities
export const hookUtils = {
  /**
   * Debounce hook for performance optimization
   */
  useDebounce: <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  },

  /**
   * Previous value hook for comparison
   */
  usePrevious: <T>(value: T): T | undefined => {
    const ref = React.useRef<T | undefined>(undefined);
    React.useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  },

  /**
   * Mount status hook
   */
  useIsMounted: (): boolean => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
      setIsMounted(true);
      return () => setIsMounted(false);
    }, []);

    return isMounted;
  },
};
