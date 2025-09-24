/**
 * QR Files/History Management Page
 * Displays user's QR code history with search and management features
 */

"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { ArrowLeft, LogIn, QrCode } from "lucide-react";
import Link from "next/link";
import { QRHistoryList } from "@/components/qr/QRHistoryList";
import { QRHistoryStats } from "@/components/qr/QRHistoryStats";
import { Button } from "@/components/ui/button";
import styles from "./files.module.css";

export default function FilesPage() {
  const { user, isLoading, loginWithRedirect } = useAuth0();

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden ${styles.forceContain}`}
      >
        <div
          className={`container mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6 ${styles.filesContainer}`}
        >
          <div className="animate-pulse">
            <div className="h-6 xs:h-8 bg-muted rounded w-32 xs:w-48 mb-4 xs:mb-6" />
            <div className="h-24 xs:h-32 bg-muted rounded mb-4 xs:mb-6" />
            <div className="space-y-3 xs:space-y-4">
              <div className="h-16 xs:h-20 bg-muted rounded" />
              <div className="h-16 xs:h-20 bg-muted rounded" />
              <div className="h-16 xs:h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden ${styles.forceContain}`}
      >
        <div
          className={`container mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6 ${styles.filesContainer}`}
        >
          <div className="text-center py-8 xs:py-12">
            <QrCode className="h-12 xs:h-16 w-12 xs:w-16 mx-auto mb-3 xs:mb-4 text-muted-foreground" />
            <h1 className="text-lg xs:text-xl sm:text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-sm xs:text-base text-muted-foreground mb-4 xs:mb-6 px-2">
              Please sign in to view your QR code history
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

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden ${styles.forceContain}`}
    >
      <div
        className={`container mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6 ${styles.filesContainer}`}
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
                  <QrCode className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className={`min-w-0 flex-1 ${styles.headerMain}`}>
                  <h1 className={`${styles.headerTitle} ${styles.safeText}`}>My QR Codes</h1>
                  <p className={`${styles.headerSubtitle} ${styles.safeText}`}>
                    Manage your QR code history and download previous creations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-6 xs:mb-8">
          <QRHistoryStats />
        </div>

        {/* History List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <QRHistoryList />
        </div>
      </div>
    </div>
  );
}
