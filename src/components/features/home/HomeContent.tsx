/**
 * Home Content Component
 * Main content area with left and right panels
 */

"use client";

import { HomeLeftPanel } from "./HomeLeftPanel";
import { HomeRightPanel } from "./HomeRightPanel";

export function HomeContent() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
      {/* Left Panel - Controls */}
      <HomeLeftPanel />

      {/* Right Panel - Preview and Actions */}
      <HomeRightPanel />
    </div>
  );
}
