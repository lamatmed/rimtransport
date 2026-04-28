import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(), // This will be the ID from Convex Auth/Clerk/etc.
    name: v.string(),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    phone: v.string(),
    role: v.union(v.literal("driver"), v.literal("passenger"), v.literal("admin")),
    photoStorageId: v.optional(v.string()),
    paymentScreenshotStorageId: v.optional(v.string()),
    isApproved: v.optional(v.boolean()),
    status: v.optional(v.string()), // "pending", "active", "suspended"
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_phone", ["phone"]),

  cars: defineTable({
    driverId: v.id("profiles"),
    brand: v.string(),
    plateNumber: v.string(),
    seats: v.number(),
    hasAC: v.optional(v.boolean()),
    hasLuggage: v.optional(v.boolean()),
    hasWifi: v.optional(v.boolean()),
    hasMusic: v.optional(v.boolean()),
    isPetFriendly: v.optional(v.boolean()),
  }).index("by_driverId", ["driverId"]),

  trips: defineTable({
    driverId: v.id("profiles"),
    carId: v.id("cars"),
    departureCity: v.string(),
    arrivalCity: v.string(),
    date: v.number(), // Timestamp in milliseconds
    price: v.number(),
    availableSeats: v.number(),
    feeAmount: v.optional(v.number()),
    paymentScreenshotStorageId: v.optional(v.string()),
    isApproved: v.optional(v.boolean()), // Default to false for new trips
  }).index("by_driverId", ["driverId"]),

  reservations: defineTable({
    tripId: v.id("trips"),
    userId: v.id("profiles"),
    seats: v.number(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("delayed")),
  })
    .index("by_tripId", ["tripId"])
    .index("by_userId", ["userId"]),

  notifications: defineTable({
    userId: v.id("profiles"),
    title: v.string(),
    message: v.string(),
    type: v.string(), // "reservation_requested", "reservation_confirmed", "reservation_cancelled"
    relatedId: v.id("reservations"),
    isRead: v.boolean(),
    metadata: v.optional(v.any()),
  }).index("by_userId", ["userId"]),
});
