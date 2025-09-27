/**
 * About Tab Component (Account Information)
 * User account details and profile information
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AboutTabProps {
  user: {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  };
}

export const AboutTab = memo(function AboutTab({ user }: AboutTabProps) {
  return (
    <Card className="shadow-lg border border-border">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <p className="text-sm text-muted-foreground">Your account details and security settings</p>
      </CardHeader>
      <CardContent className="space-y-4 xs:space-y-6">
        <div className="flex items-center gap-4">
          {user.picture ? (
            <Image
              src={user.picture}
              alt={user.name || "User"}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium text-xl">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-1">
              Verified Account
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Button variant="outline" size="sm" asChild={true}>
            <Link href="/profile">View Full Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
