/**
 * User Profile Page
 * Displays user profile information and settings
 */

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { ArrowLeft, User, Mail, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export const metadata = {
  title: "Profile - QR PDF Generator",
  description: "View and manage your profile information",
};

export default async function ProfilePage() {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect("/auth/login?returnTo=/profile");
  }

  const { user } = session;

  const userInitials = user.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Generator
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={user.picture || ""} 
                    alt={user.name || "User avatar"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg font-medium bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold">{user.name || "User"}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{user.sub}</p>
                  </div>
                </div>

                {user.updated_at && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button asChild>
                  <Link href="/files">View My QR Codes</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/auth/logout">Logout</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
