/**
 * Convex Database Schema
 * Defines the database schema for QR code history and user data
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // QR Code History table
  qrHistory: defineTable({
    // User identification
    userId: v.string(),

    // QR Code content
    textContent: v.string(),

    // QR Code generation settings
    qrSettings: v.object({
      size: v.number(),
      margin: v.number(),
      errorCorrectionLevel: v.string(),
      foreground: v.string(),
      background: v.string(),
      format: v.string(),
      logoUrl: v.optional(v.string()),
      logoSize: v.optional(v.number()),
      logoBackground: v.optional(v.boolean()),
    }),

    // Metadata
    generationMethod: v.optional(v.string()),
    browserInfo: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"])
    .searchIndex("search_content", {
      searchField: "textContent",
      filterFields: ["userId"],
    }),

  // User preferences (optional for future use)
  userPreferences: defineTable({
    userId: v.string(),
    preferences: v.object({
      defaultQRSize: v.number(),
      defaultErrorCorrection: v.string(),
      favoriteColors: v.array(v.string()),
      autoSaveHistory: v.boolean(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
