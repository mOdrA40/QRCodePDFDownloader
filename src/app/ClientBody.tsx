"use client";

import { useEffect } from "react";

export default function ClientBody({ children }: { children: React.ReactNode }) {
  // Ensure proper scrolling behavior and layout
  useEffect(() => {
    // This runs only on the client after hydration
    document.documentElement.style.overflowY = "auto";
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowY = "auto";
    document.body.style.overflowX = "hidden";
    document.body.style.height = "auto";
    document.body.style.width = "100%";
    document.documentElement.style.height = "auto";
    document.documentElement.style.width = "100%";
  }, []);

  return <div className="w-full min-h-screen">{children}</div>;
}
