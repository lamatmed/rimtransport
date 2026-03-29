import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserNotifications = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

export const getUnreadCount = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();
    return unread.length;
  },
});

/**
 * Fetch a single notification by its ID
 */
export const getNotificationById = query({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
