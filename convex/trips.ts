import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listAvailableTrips = query({
  args: {
    departureCity: v.optional(v.string()),
    arrivalCity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tripsQuery = ctx.db
      .query("trips")
      .filter((q) => q.gt(q.field("availableSeats"), 0));

    const trips = await tripsQuery.collect();

    // Filtering by city (case-insensitive simulation)
    const filteredTrips = trips.filter((trip) => {
      let match = true;
      if (args.departureCity) {
        match = match && trip.departureCity.toLowerCase().includes(args.departureCity.toLowerCase());
      }
      if (args.arrivalCity) {
        match = match && trip.arrivalCity.toLowerCase().includes(args.arrivalCity.toLowerCase());
      }
      return match;
    });
    filteredTrips.sort((a, b) => b._creationTime - a._creationTime);

    // Expand profiles and cars
    return await Promise.all(
      filteredTrips.map(async (trip) => {
        const driver = await ctx.db.get(trip.driverId);
        const car = await ctx.db.get(trip.carId);
        const driverPhotoUrl = driver?.photoStorageId
          ? await ctx.storage.getUrl(driver.photoStorageId)
          : null;
        return {
          ...trip,
          id: trip._id, // Map for UI compatibility
          profiles: driver ? { ...driver, id: driver._id, photoUrl: driverPhotoUrl } : null,
          cars: car ? { ...car, id: car._id } : null,
        };
      })
    );
  },
});

export const getTripDetails = query({
  args: { id: v.id("trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.id);
    if (!trip) return null;

    const driver = await ctx.db.get(trip.driverId);
    const car = await ctx.db.get(trip.carId);
    const driverPhotoUrl = driver?.photoStorageId
      ? await ctx.storage.getUrl(driver.photoStorageId)
      : null;

    return {
      ...trip,
      id: trip._id, // Map for UI compatibility
      profiles: driver ? { ...driver, id: driver._id, photoUrl: driverPhotoUrl } : null,
      cars: car ? { ...car, id: car._id } : null,
    };
  },
});

export const createTrip = mutation({
  args: {
    driverId: v.id("profiles"),
    carId: v.id("cars"),
    departureCity: v.string(),
    arrivalCity: v.string(),
    date: v.number(),
    price: v.number(),
    availableSeats: v.number(),
  },
  handler: async (ctx, args) => {
    const tripId = await ctx.db.insert("trips", args);
    return await ctx.db.get(tripId);
  },
});

export const updateTrip = mutation({
  args: {
    id: v.id("trips"),
    carId: v.optional(v.id("cars")),
    departureCity: v.optional(v.string()),
    arrivalCity: v.optional(v.string()),
    date: v.optional(v.number()),
    price: v.optional(v.number()),
    availableSeats: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const getDriverTrips = query({
  args: { driverId: v.id("profiles") },
  handler: async (ctx, args) => {
    const trips = await ctx.db
      .query("trips")
      .withIndex("by_driverId", (q) => q.eq("driverId", args.driverId))
      .collect();

    return await Promise.all(
      trips.map(async (trip) => {
        const driver = await ctx.db.get(trip.driverId);
        const car = await ctx.db.get(trip.carId);
        const driverPhotoUrl = driver?.photoStorageId
          ? await ctx.storage.getUrl(driver.photoStorageId)
          : null;
        return {
          ...trip,
          id: trip._id, // Map for UI compatibility
          profiles: driver ? { ...driver, id: driver._id, photoUrl: driverPhotoUrl } : null,
          cars: car ? { ...car, id: car._id } : null,
        };
      })
    );
  },
});

export const deleteTrip = mutation({
  args: {
    id: v.id("trips"),
    driverId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.id);
    if (!trip) {
      throw new Error("Trip not found");
    }
    if (String(trip.driverId) !== String(args.driverId)) {
      throw new Error("Unauthorized");
    }

    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.id))
      .collect();

    for (const reservation of reservations) {
      await ctx.db.delete(reservation._id);
    }
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

export const cleanupPastTrips = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const trips = await ctx.db.query("trips").collect();
    const pastTrips = trips.filter((trip) => Number(trip.date) < now);

    for (const trip of pastTrips) {
      const reservations = await ctx.db
        .query("reservations")
        .withIndex("by_tripId", (q) => q.eq("tripId", trip._id))
        .collect();

      for (const reservation of reservations) {
        await ctx.db.delete(reservation._id);
      }
      await ctx.db.delete(trip._id);
    }

    return { deletedTrips: pastTrips.length };
  },
});
