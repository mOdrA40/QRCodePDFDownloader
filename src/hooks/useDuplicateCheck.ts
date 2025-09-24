/**
 * Duplicate Check Hook
 * Provides functionality to check for duplicate QR codes
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

interface UseDuplicateCheckProps {
  textContent: string;
  enabled?: boolean;
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingQR: Doc<"qrHistory"> | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDuplicateCheck({
  textContent,
  enabled = true,
}: UseDuplicateCheckProps): DuplicateCheckResult {
  // Only check if enabled and textContent is not empty
  const shouldCheck = enabled && textContent.trim().length > 0;

  const result = useQuery(
    api.qrHistory.checkDuplicateQR,
    shouldCheck ? { textContent: textContent.trim() } : "skip"
  );

  return {
    isDuplicate: result?.isDuplicate ?? false,
    existingQR: result?.existingQR || null,
    isLoading: result === undefined && shouldCheck,
    error: null, // Convex handles errors internally
  };
}

/**
 * Hook for checking duplicates with debouncing
 */
import { useEffect, useState } from "react";

interface UseDebouncedDuplicateCheckProps {
  textContent: string;
  debounceMs?: number;
  enabled?: boolean;
}

export function useDebouncedDuplicateCheck({
  textContent,
  debounceMs = 500,
  enabled = true,
}: UseDebouncedDuplicateCheckProps): DuplicateCheckResult {
  const [debouncedText, setDebouncedText] = useState(textContent);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(textContent);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [textContent, debounceMs]);

  return useDuplicateCheck({
    textContent: debouncedText,
    enabled,
  });
}
