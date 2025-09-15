/**
 * Convex QR History Functions
 * Database operations for QR code history management
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Auth helper function - simplified for Auth0 integration
async function getAuthUserId(ctx: any): Promise<string | null> {
  // biome-ignore lint/suspicious/noExplicitAny: Convex context type is complex
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject || null;
}

/**
 * Get user's QR code history with pagination
 */
export const getUserQRHistory = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("qrHistory")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/**
 * Search user's QR code history
 */
export const searchQRHistory = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("qrHistory")
      .withSearchIndex("search_content", (q) =>
        q.search("textContent", args.searchTerm).eq("userId", userId)
      )
      .collect();
  },
});

/**
 * Save QR code to history
 */
export const saveQRToHistory = mutation({
  args: {
    textContent: v.string(),
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
    generationMethod: v.optional(v.string()),
    browserInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const insertData: any = {
      userId,
      textContent: args.textContent,
      qrSettings: args.qrSettings,
      createdAt: now,
      updatedAt: now,
    };

    if (args.generationMethod) {
      insertData.generationMethod = args.generationMethod;
    }

    if (args.browserInfo) {
      insertData.browserInfo = args.browserInfo;
    }

    return await ctx.db.insert("qrHistory", insertData);
  },
});

/**
 * Delete QR code from history
 */
export const deleteQRFromHistory = mutation({
  args: {
    qrId: v.id("qrHistory"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const qrRecord = await ctx.db.get(args.qrId);
    if (!qrRecord || qrRecord.userId !== userId) {
      throw new Error("QR code not found or access denied");
    }

    await ctx.db.delete(args.qrId);
  },
});

/**
 * Get QR code statistics for user
 */
export const getQRStatistics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const allQRs = await ctx.db
      .query("qrHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalGenerated = allQRs.length;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayGenerated = allQRs.filter(qr => qr.createdAt >= todayStart).length;

    // Calculate format usage
    const formatUsage: Record<string, number> = {};
    allQRs.forEach(qr => {
      const format = qr.qrSettings.format;
      formatUsage[format] = (formatUsage[format] || 0) + 1;
    });

    const favoriteFormat = Object.entries(formatUsage)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "png";

    return {
      totalGenerated,
      todayGenerated,
      favoriteFormat,
      formatUsage,
      lastUsed: allQRs[0]?.createdAt ? new Date(allQRs[0].createdAt).toLocaleDateString() : "Never",
    };
  },
});
