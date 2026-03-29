import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getDriverCars = query({
  args: { driverId: v.id("profiles") },
  handler: async (ctx, args) => {
    const cars = await ctx.db
      .query("cars")
      .withIndex("by_driverId", (q) => q.eq("driverId", args.driverId))
      .collect();
    
    return cars.map(car => ({ ...car, id: car._id }));
  },
});

export const createCar = mutation({
  args: {
    driverId: v.id("profiles"),
    brand: v.string(),
    plateNumber: v.string(),
    seats: v.number(),
    hasAC: v.optional(v.boolean()),
    hasLuggage: v.optional(v.boolean()),
    hasWifi: v.optional(v.boolean()),
    hasMusic: v.optional(v.boolean()),
    isPetFriendly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cars", args);
  },
});

export const updateCar = mutation({
  args: {
    id: v.id("cars"),
    brand: v.optional(v.string()),
    plateNumber: v.optional(v.string()),
    seats: v.optional(v.number()),
    hasAC: v.optional(v.boolean()),
    hasLuggage: v.optional(v.boolean()),
    hasWifi: v.optional(v.boolean()),
    hasMusic: v.optional(v.boolean()),
    isPetFriendly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    const updated = await ctx.db.get(id);
    return updated ? { ...updated, id: updated._id } : null;
  },
});

export const deleteCar = mutation({
  args: { id: v.id("cars") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
