import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ClientBody from "./ClientBody";

export const metadata: Metadata = {
  title: "QR PDF Generator - Professional QR Code & PDF Creator",
  description:
    "Create stunning QR codes and download them as beautiful PDFs with advanced customization options. Professional QR code generator with real-time preview and multiple export formats.",
  keywords:
    "QR code generator, PDF creator, QR code PDF, custom QR codes, professional QR generator",
  authors: [{ name: "QR PDF Generator" }],
  creator: "QR PDF Generator",
  publisher: "QR PDF Generator",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientBody>
            {children}
            <Toaster />
          </ClientBody>
        </ThemeProvider>
      </body>
    </html>
  );
}
