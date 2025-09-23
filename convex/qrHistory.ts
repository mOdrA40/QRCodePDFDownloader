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
 * Get user's QR code history with optimization and pagination support
 */
export const getUserQRHistory = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const limit = Math.min(args.limit || 100, 1000); 

    return await ctx.db
      .query("qrHistory")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

/**
 * Get user's QR code history 
 */
export const getUserQRHistorySimple = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Return recent 20 items for performance
    return await ctx.db
      .query("qrHistory")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

/**
 * Search user's QR code history with performance optimization
 */
export const searchQRHistory = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Trim and validate search term
    const trimmedSearchTerm = args.searchTerm.trim();
    if (trimmedSearchTerm.length === 0) {
      return [];
    }

    const limit = Math.min(args.limit || 500, 1000); 

    return await ctx.db
      .query("qrHistory")
      .withSearchIndex("search_content", (q) =>
        q.search("textContent", trimmedSearchTerm).eq("userId", userId)
      )
      .take(limit);
  },
});

/**
 * Check for duplicate QR code in user's history
 */
export const checkDuplicateQR = query({
  args: {
    textContent: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { isDuplicate: false, existingQR: null };
    }

    // Use optimized index for duplicate checking
    const existingQR = await ctx.db
      .query("qrHistory")
      .withIndex("by_user_text", (q) =>
        q.eq("userId", userId).eq("textContent", args.textContent)
      )
      .first();

    return {
      isDuplicate: !!existingQR,
      existingQR: existingQR || null,
    };
  },
});

/**
 * Save QR code to history with duplicate checking
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
    skipDuplicateCheck: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, error: "Not authenticated", isDuplicate: false };
    }

    // Check for duplicates unless explicitly skipped
    if (!args.skipDuplicateCheck) {
      const existingQR = await ctx.db
        .query("qrHistory")
        .withIndex("by_user_text", (q) =>
          q.eq("userId", userId).eq("textContent", args.textContent)
        )
        .first();

      if (existingQR) {
        return {
          success: false,
          error: "DUPLICATE_QR_EXISTS",
          isDuplicate: true,
          existingQR
        };
      }
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

    const qrId = await ctx.db.insert("qrHistory", insertData);
    return { success: true, qrId, isDuplicate: false };
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
 * Get QR code statistics for user (optimized)
 */
export const getQRStatistics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get recent QRs for statistics (limit for performance)
    const recentQRs = await ctx.db
      .query("qrHistory")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(500); 

    const totalGenerated = recentQRs.length;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayGenerated = recentQRs.filter(qr => qr.createdAt >= todayStart).length;

    // Calculate format usage efficiently
    const formatUsage: Record<string, number> = {};
    let favoriteFormat = 'png';
    let maxCount = 0;

    for (const qr of recentQRs) {
      const format = qr.qrSettings.format;
      const count = (formatUsage[format] || 0) + 1;
      formatUsage[format] = count;

      if (count > maxCount) {
        maxCount = count;
        favoriteFormat = format;
      }
    }

    return {
      totalGenerated,
      todayGenerated,
      favoriteFormat,
      formatUsage,
      lastUsed: recentQRs[0]?.createdAt ? new Date(recentQRs[0].createdAt).toLocaleDateString() : "Never",
    };
  },
});
