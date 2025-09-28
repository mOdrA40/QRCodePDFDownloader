/**
 * QR Files/History Management Page
 * Displays user's QR code history with search and management features
 */

"use client";

import { FilesAuthRequired, FilesHeader, FilesList, FilesStats } from "@/components/features/files";
import { useFilesAuth } from "@/hooks/files";

export default function FilesPage() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useFilesAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden max-w-full">
        <div className="w-full max-w-[calc(100vw-1.5rem)] mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6">
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
  if (!isAuthenticated) {
    return <FilesAuthRequired onLogin={loginWithRedirect} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden max-w-full">
      <div className="w-full max-w-[calc(100vw-1.5rem)] mx-auto py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6 overflow-x-hidden">
        <FilesHeader />
        <FilesStats />
        <FilesList />
      </div>
    </div>
  );
}
