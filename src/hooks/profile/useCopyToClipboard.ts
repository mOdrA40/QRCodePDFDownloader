/**
 * Copy to Clipboard Hook
 * Reusable hook with toast notifications and state management
 */

"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

export interface CopyState {
  copiedField: string | null;
  copyText: (text: string, field: string, successMessage?: string) => Promise<void>;
}

export function useCopyToClipboard(): CopyState {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyText = useCallback(async (text: string, field: string, successMessage?: string) => {
    try {
      const success = await copyToClipboard(text);

      if (success) {
        setCopiedField(field);
        toast.success(successMessage || "Copied to clipboard!");

        // Reset after 2 seconds
        setTimeout(() => setCopiedField(null), 2000);
      } else {
        toast.error("Failed to copy to clipboard");
      }
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy to clipboard");
    }
  }, []);

  return {
    copiedField,
    copyText,
  };
}
