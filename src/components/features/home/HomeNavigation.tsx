/**
 * Home Navigation Component
 * Top navigation with auth button and theme toggle
 */

"use client";

import { AuthButton } from "@/components/features/auth";
import { ThemeToggle } from "@/components/shared/layout";

export function HomeNavigation() {
  return (
    <div className="flex justify-end items-center gap-3 mb-4">
      <AuthButton />
      <ThemeToggle />
    </div>
  );
}
