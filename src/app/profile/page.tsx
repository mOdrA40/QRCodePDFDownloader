/**
 * User Profile Page
 * Displays user profile information and settings
 */

"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { ArrowLeft, Calendar, Check, Copy, LogIn, Mail, Shield, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { user, isLoading, loginWithRedirect } = useAuth0();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

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
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">
        <div className="w-full max-w-[calc(100vw-1.5rem)] mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6">
          <div className="text-center py-8 xs:py-12">
            <User className="h-12 xs:h-16 w-12 xs:w-16 mx-auto mb-3 xs:mb-4 text-muted-foreground" />
            <h1 className="text-lg xs:text-xl sm:text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-sm xs:text-base text-muted-foreground mb-4 xs:mb-6 px-2">
              Please sign in to view your profile
            </p>
            <Button onClick={() => loginWithRedirect()} className="w-full xs:w-auto">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const userInitials =
    user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <TooltipProvider>
      <div
        className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden ${styles.forceContain}`}
      >
        <div
          className={`w-full max-w-[calc(100vw-1.5rem)] mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6 ${styles.profileContainer}`}
        >
          {/* Header */}
          <div className={`mb-6 xs:mb-8 ${styles.headerContainer}`}>
            <div className={styles.headerContent}>
              <div className={styles.headerTop}>
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
                  <div className={`min-w-0 flex-1 ${styles.headerMain}`}>
                    <h1 className={`${styles.headerTitle} ${styles.safeText}`}>Profile</h1>
                    <p className={`${styles.headerSubtitle} ${styles.safeText}`}>
                      View and manage your account information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className={`w-full max-w-full ${styles.profileCard}`}>
            <Card className={`overflow-hidden ${styles.profileCard}`}>
              <CardHeader className="pb-3 xs:pb-4">
                <CardTitle className="flex items-center gap-2 xs:gap-3 text-base xs:text-lg sm:text-xl">
                  <User className="h-4 w-4 xs:h-5 xs:w-5 shrink-0" />
                  <span className="truncate">User Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 xs:space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col xs:flex-row items-center xs:items-start gap-3 xs:gap-4">
                  <Avatar className="h-12 w-12 xs:h-16 xs:w-16 sm:h-20 sm:w-20 shrink-0">
                    <AvatarImage
                      src={user.picture || ""}
                      alt={user.name || "User avatar"}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-sm xs:text-base sm:text-lg font-medium bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`text-center xs:text-left min-w-0 flex-1 w-full ${styles.textContainer}`}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild={true}>
                        <h2
                          className={`text-lg xs:text-xl sm:text-2xl font-semibold cursor-help ${styles.truncateText}`}
                        >
                          {user.name || "User"}
                        </h2>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs break-words">{user.name || "User"}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild={true}>
                        <p
                          className={`text-muted-foreground text-xs xs:text-sm sm:text-base cursor-help mt-1 ${styles.emailText}`}
                        >
                          {user.email}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs break-all">{user.email}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid gap-3 xs:gap-4">
                  <div
                    className={`flex items-start gap-2 xs:gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg ${styles.subCard}`}
                  >
                    <Mail className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className={`min-w-0 flex-1 ${styles.textContainer}`}>
                      <p className="text-xs xs:text-sm font-medium">Email</p>
                      <div className="flex items-center gap-1 xs:gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild={true}>
                            <p
                              className={`text-xs xs:text-sm text-muted-foreground cursor-help break-anywhere ${styles.emailText} ${styles.safeText}`}
                            >
                              {user.email}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs break-all">{user.email}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 xs:h-6 xs:w-6 p-0 shrink-0"
                          onClick={() => copyToClipboard(user.email || "", "email")}
                        >
                          {copiedField === "email" ? (
                            <Check className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-green-600" />
                          ) : (
                            <Copy className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-start gap-2 xs:gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg ${styles.subCard}`}
                  >
                    <Shield className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className={`min-w-0 flex-1 ${styles.textContainer}`}>
                      <p className="text-xs xs:text-sm font-medium">User ID</p>
                      <div className="flex items-center gap-1 xs:gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild={true}>
                            <p
                              className={`text-xs xs:text-sm text-muted-foreground cursor-help break-anywhere ${styles.userIdText} ${styles.safeText}`}
                            >
                              {user.sub}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs break-all font-mono">{user.sub}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 xs:h-6 xs:w-6 p-0 shrink-0"
                          onClick={() => copyToClipboard(user.sub || "", "userId")}
                        >
                          {copiedField === "userId" ? (
                            <Check className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-green-600" />
                          ) : (
                            <Copy className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {user.updated_at && (
                    <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs xs:text-sm font-medium">Last Updated</p>
                        <p className="text-xs xs:text-sm text-muted-foreground">
                          {new Date(user.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 pt-3 xs:pt-4">
                  <Button asChild={true} className="w-full xs:w-auto text-sm">
                    <Link href="/files">View My QR Codes</Link>
                  </Button>
                  <Button variant="outline" asChild={true} className="w-full xs:w-auto text-sm">
                    <a href="/auth/logout">Logout</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
