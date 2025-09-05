"use client";

import React from "react";
import { QRGenerator } from "@/components/qr";
import { AppProviders } from "@/contexts";

export default function QRCodePDFDownloader() {
  return (
    <AppProviders>
      <QRGenerator />
    </AppProviders>
  );
}