import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// For now, since we're migrating from Supabase, we'll store profile data.
// Convex is usually used with Clerk, but let's provide mutations for a custom integration
// or just a direct way to save profiles.

export const createProfile = mutation({
  args: {
    userId: v.string(), // Clerk or other provider's userId
    name: v.string(),
    email: v.optional(v.string()),
    password: v.string(),
    phone: v.string(),
    role: v.union(v.literal("driver"), v.literal("passenger")),
  },
  handler: async (ctx, args) => {
    const existingPhone = await ctx.db
      .query("profiles")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();

    if (existingPhone) {
      throw new Error("Phone number already registered");
    }

    if (args.email) {
      const existingEmail = await ctx.db
        .query("profiles")
        .withIndex("by_email", (q) => q.eq("email", args.email!))
        .unique();

      if (existingEmail) {
        throw new Error("Email already registered");
      }
    }

    return await ctx.db.insert("profiles", {
      userId: args.userId,
      name: args.name,
      email: args.email,
      password: args.password,
      phone: args.phone,
      role: args.role,
    });
  },
});

export const login = query({
  args: { phone: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("profiles")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();

    if (!user || user.password !== args.password) {
      return null;
    }
    return { ...user, id: user._id };
  },
});

export const getProfileByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!profile) return null;
    const photoUrl = profile.photoStorageId
      ? await ctx.storage.getUrl(profile.photoStorageId)
      : null;
    return { ...profile, id: profile._id, photoUrl };
  },
});

export const getProfileById = query({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.id);
    if (!profile) return null;
    const photoUrl = profile.photoStorageId
      ? await ctx.storage.getUrl(profile.photoStorageId)
      : null;
    return { ...profile, id: profile._id, photoUrl };
  },
});

export const updateProfile = mutation({
  args: {
    id: v.id("profiles"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("driver"), v.literal("passenger"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Profile not found");
    }

    const patch: {
      name?: string;
      phone?: string;
      email?: string;
      role?: "driver" | "passenger";
    } = {};

    if (typeof args.name === "string") patch.name = args.name;
    if (typeof args.phone === "string") patch.phone = args.phone;
    if (typeof args.email === "string") patch.email = args.email;
    if (typeof args.role === "string") patch.role = args.role;

    await ctx.db.patch(args.id, patch);
    const updated = await ctx.db.get(args.id);
    return updated ? { ...updated, id: updated._id } : null;
  },
});

export const generateProfilePhotoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const setProfilePhoto = mutation({
  args: {
    id: v.id("profiles"),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { photoStorageId: args.storageId });
    const updated = await ctx.db.get(args.id);
    if (!updated) return null;
    const photoUrl = updated.photoStorageId
      ? await ctx.storage.getUrl(updated.photoStorageId)
      : null;
    return { ...updated, id: updated._id, photoUrl };
  },
});

export const changePassword = mutation({
  args: {
    id: v.id("profiles"),
    oldPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("Profile not found");
    }
    if (!user.password || user.password.trim() !== args.oldPassword.trim()) {
      throw new Error("Incorrect current password");
    }
    await ctx.db.patch(args.id, { password: args.newPassword.trim() });
    return true;
  },
});
