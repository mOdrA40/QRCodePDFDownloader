/**
 * User Initials Hook
 * Reusable hook for generating user initials
 */

"use client";

import { useMemo } from "react";
import { getUserInitials } from "@/lib/utils";

export function useUserInitials(name?: string | null): string {
  return useMemo(() => getUserInitials(name), [name]);
}
