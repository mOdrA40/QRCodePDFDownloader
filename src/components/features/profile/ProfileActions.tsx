/**
 * Profile Actions Component
 * Action buttons for profile page
 */

"use client";

import Link from "next/link";
import { memo } from "react";
import { Button } from "@/components/ui/button";

export const ProfileActions = memo(function ProfileActions() {
  return (
    <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 pt-3 xs:pt-4">
      <Button asChild={true} className="w-full xs:w-auto text-sm">
        <Link href="/files">View My QR Codes</Link>
      </Button>
      <Button variant="outline" asChild={true} className="w-full xs:w-auto text-sm">
        <a href="/auth/logout">Logout</a>
      </Button>
    </div>
  );
});
