/**
 * Profile Header Component
 * Displays page header with navigation and title
 */

"use client";

import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Button } from "@/components/ui/button";

export const ProfileHeader = memo(function ProfileHeader() {
  return (
    <div className="mb-6 xs:mb-8 w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 items-start">
        <div className="flex items-center gap-3 w-full flex-wrap">
          <Button variant="ghost" size="sm" asChild={true} className="shrink-0 h-8 px-2">
            <Link href="/" className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="text-sm hidden xs:inline">Back to Generator</span>
              <span className="text-sm xs:hidden">Back</span>
            </Link>
          </Button>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
            <div className="p-1.5 xs:p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg shrink-0">
              <User className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">
                Profile
              </h1>
              <p className="text-sm xs:text-base text-muted-foreground break-words max-w-full">
                View and manage your account information
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
