/**
 * Convex User Preferences Functions
 * Database operations for user settings and preferences
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Auth helper function
async function getAuthUserId(ctx: any): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject || null;
}

/**
 * Get user preferences
 */
export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Return default preferences if none exist
    if (!preferences) {
      return {
        userId,
        preferences: {
          defaultQRSize: 512,
          defaultErrorCorrection: "M",
          favoriteColors: ["#000000", "#ffffff"],
          autoSaveHistory: true,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return preferences;
  },
});

/**
 * Update user preferences
 */
export const updateUserPreferences = mutation({
  args: {
    preferences: v.object({
      defaultQRSize: v.number(),
      defaultErrorCorrection: v.string(),
      favoriteColors: v.array(v.string()),
      autoSaveHistory: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing preferences
      return await ctx.db.patch(existing._id, {
        preferences: args.preferences,
        updatedAt: now,
      });
    }
    // Create new preferences
    return await ctx.db.insert("userPreferences", {
      userId,
      preferences: args.preferences,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Reset user preferences to defaults
 */
export const resetUserPreferences = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const defaultPreferences = {
      defaultQRSize: 512,
      defaultErrorCorrection: "M",
      favoriteColors: ["#000000", "#ffffff"],
      autoSaveHistory: true,
    };

    const now = Date.now();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        preferences: defaultPreferences,
        updatedAt: now,
      });
    }
    return await ctx.db.insert("userPreferences", {
      userId,
      preferences: defaultPreferences,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Delete user preferences (for account deletion)
 */
export const deleteUserPreferences = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { success: true };
    }

    return { success: false, message: "No preferences found" };
  },
});
