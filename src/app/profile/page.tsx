/**
 * User Profile Page
 * Displays user profile information and settings
 */

"use client";

import { Calendar, Mail, Shield, User } from "lucide-react";
import {
  AuthRequired,
  ProfileActions,
  ProfileAvatar,
  ProfileDetailItem,
  ProfileHeader,
} from "@/components/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthGuard } from "@/hooks/profile";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, loginWithRedirect } = useAuthGuard();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">
        <div className="w-full max-w-[calc(100vw-1.5rem)] mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6">
          <div className="animate-pulse">
            <div className="h-6 xs:h-8 bg-muted rounded w-24 xs:w-32 mb-4 xs:mb-6" />
            <div className="h-48 xs:h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <AuthRequired
        icon={User}
        title="Sign In Required"
        description="Please sign in to view your profile"
        onLogin={loginWithRedirect}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden max-w-full">
        <div className="w-full max-w-[calc(100vw-1.5rem)] mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6 overflow-x-hidden">
          <ProfileHeader />

          {/* Profile Card */}
          <div className="w-full max-w-full overflow-hidden">
            <Card className="overflow-hidden w-full max-w-full">
              <CardHeader className="pb-3 xs:pb-4">
                <CardTitle className="flex items-center gap-2 xs:gap-3 text-base xs:text-lg sm:text-xl">
                  <User className="h-4 w-4 xs:h-5 xs:w-5 shrink-0" />
                  <span className="truncate">User Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 xs:space-y-6">
                <ProfileAvatar user={user} />

                {/* Profile Details */}
                <div className="grid gap-3 xs:gap-4">
                  <ProfileDetailItem
                    icon={Mail}
                    label="Email"
                    value={user.email || ""}
                    field="email"
                  />

                  <ProfileDetailItem
                    icon={Shield}
                    label="User ID"
                    value={user.sub || ""}
                    field="userId"
                    isMonospace={true}
                  />

                  {user.updated_at && (
                    <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg w-full max-w-full overflow-hidden">
                      <Calendar className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="text-xs xs:text-sm font-medium">Last Updated</p>
                        <p className="text-xs xs:text-sm text-muted-foreground">
                          {formatDate(user.updated_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <ProfileActions />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
