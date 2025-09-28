/**
 * Auth Required Component
 * Reusable component for unauthenticated state
 */

"use client";

import { LogIn, type LucideIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";

interface AuthRequiredProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onLogin: () => void;
}

export const AuthRequired = memo(function AuthRequired({
  icon: Icon,
  title,
  description,
  onLogin,
}: AuthRequiredProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">
      <div className="w-full max-w-[calc(100vw-1.5rem)] mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6">
        <div className="text-center py-8 xs:py-12">
          <Icon className="h-12 xs:h-16 w-12 xs:w-16 mx-auto mb-3 xs:mb-4 text-muted-foreground" />
          <h1 className="text-lg xs:text-xl sm:text-2xl font-bold mb-2">{title}</h1>
          <p className="text-sm xs:text-base text-muted-foreground mb-4 xs:mb-6 px-2">
            {description}
          </p>
          <Button onClick={onLogin} className="w-full xs:w-auto">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
});
