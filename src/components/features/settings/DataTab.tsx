/**
 * Data Tab Component
 * Data management and export settings
 */

"use client";

import Link from "next/link";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DataTab = memo(function DataTab() {
  return (
    <Card className="shadow-lg border border-border">
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <p className="text-sm text-muted-foreground">Manage your QR code history and data</p>
      </CardHeader>
      <CardContent className="space-y-4 xs:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">QR History</h3>
            <p className="text-sm text-muted-foreground mb-3">
              View and manage your saved QR codes
            </p>
            <Button variant="outline" size="sm" asChild={true}>
              <Link href="/files">View History</Link>
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Export Data</h3>
            <p className="text-sm text-muted-foreground mb-3">Download your QR code data</p>
            <Button variant="outline" size="sm" disabled={true}>
              Coming Soon
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
