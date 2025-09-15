/**
 * QR Files/History Management Page
 * Displays user's QR code history with search and management features
 */

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { QRHistoryList } from "@/components/qr/QRHistoryList";
import { QRHistoryStats } from "@/components/qr/QRHistoryStats";
import { ArrowLeft, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "My QR Codes - QR PDF Generator",
  description: "Manage your QR code history and download previous creations",
};

export default async function FilesPage() {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect("/auth/login?returnTo=/files");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Generator
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My QR Codes
                </h1>
                <p className="text-muted-foreground">
                  Manage your QR code history and download previous creations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <QRHistoryStats />
        </div>

        {/* History List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <QRHistoryList />
        </div>
      </div>
    </div>
  );
}
