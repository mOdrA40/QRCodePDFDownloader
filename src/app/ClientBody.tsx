"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure proper scrolling behavior
  useEffect(() => {
    // This runs only on the client after hydration
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
    document.body.style.height = "auto";
    document.documentElement.style.height = "auto";
  }, []);

  return <>{children}</>;
}
