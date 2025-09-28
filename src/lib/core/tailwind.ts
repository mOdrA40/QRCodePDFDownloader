/**
 * Tailwind CSS Utilities
 * Core utility for merging Tailwind CSS classes
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges Tailwind CSS classes
 * Most used utility function in the application
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
