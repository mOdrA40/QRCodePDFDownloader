/**
 * User Interface Helper Utilities
 * Functions for user-related UI operations
 */

/**
 * Generate user initials from name
 */
export function getUserInitials(name?: string | null): string {
  if (!name) return "U";

  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
