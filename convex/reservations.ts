import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const reserveSeats = mutation({
  args: {
    tripId: v.id("trips"),
    userId: v.id("profiles"),
    seats: v.number(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");

    if (trip.availableSeats < args.seats) {
      throw new Error("Not enough seats available");
    }

    // Insert reservation
    const reservationId = await ctx.db.insert("reservations", {
      tripId: args.tripId,
      userId: args.userId,
      seats: args.seats,
      status: "pending",
    });

    // Update remaining seats in trip
    await ctx.db.patch(args.tripId, {
      availableSeats: trip.availableSeats - args.seats,
    });

    // Create notification for driver
    const driver = await ctx.db.get(trip.driverId);
    if (driver) {
      const passenger = await ctx.db.get(args.userId);
      await ctx.db.insert("notifications", {
        userId: trip.driverId,
        title: "Nouvelle réservation",
        message: `${passenger?.name || 'Un passager'} a réservé ${args.seats} place(s) pour votre trajet ${trip.departureCity} → ${trip.arrivalCity}`,
        type: "reservation_requested",
        relatedId: reservationId,
        isRead: false,
        metadata: {
          name: passenger?.name || 'Un passager',
          seats: args.seats,
          from: trip.departureCity,
          to: trip.arrivalCity,
        },
      });

      // NOUVEAU: Notification pour le passager lui-même
      await ctx.db.insert("notifications", {
        userId: args.userId,
        title: "Demande envoyée",
        message: `Votre réservation pour le trajet ${trip.departureCity} → ${trip.arrivalCity} est en attente de confirmation.`,
        type: "reservation_requested", // On réutilise le type car le message dépendra des métadonnées
        relatedId: reservationId,
        isRead: false,
        metadata: {
          from: trip.departureCity,
          to: trip.arrivalCity,
          seats: args.seats,
          isForPassenger: true, // Tag pour différencier dans le futur si besoin
        },
      });
    }

    return await ctx.db.get(reservationId);
  },
});

export const getUserReservations = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc") // Implicit by _creationTime
      .collect();

    return await Promise.all(
      reservations.map(async (res) => {
        const trip = await ctx.db.get(res.tripId);
        if (!trip) return res;

        const driver = await ctx.db.get(trip.driverId);
        const car = await ctx.db.get(trip.carId);
        const driverPhotoUrl = driver?.photoStorageId
          ? await ctx.storage.getUrl(driver.photoStorageId)
          : null;

        return {
          ...res,
          id: res._id,
          trips: trip ? {
            ...trip,
            id: trip._id,
            profiles: driver ? { ...driver, id: driver._id, photoUrl: driverPhotoUrl } : null,
            cars: car ? { ...car, id: car._id } : null,
          } : null,
        };
      })
    );
  },
});

export const getTripReservations = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    return await Promise.all(
      reservations.map(async (res) => {
        const profile = await ctx.db.get(res.userId);
        const passengerPhotoUrl = profile?.photoStorageId
          ? await ctx.storage.getUrl(profile.photoStorageId)
          : null;
        return {
          ...res,
          id: res._id,
          profiles: profile ? { ...profile, id: profile._id, photoUrl: passengerPhotoUrl } : null,
        };
      })
    );
  },
});

export const getDriverReservations = query({
  args: { driverId: v.id("profiles") },
  handler: async (ctx, args) => {
    // 1. Get all trips by this driver
    const trips = await ctx.db
      .query("trips")
      .withIndex("by_driverId", (q) => q.eq("driverId", args.driverId))
      .collect();

    if (trips.length === 0) return [];

    const tripIds = trips.map((t) => t._id);

    // 2. Get all reservations for these trips
    // Note: Convex doesn't have 'in' operator, so we fetch per trip or query all and filter
    const allReservations = await ctx.db.query("reservations").collect();
    const driverReservations = allReservations.filter((res) => tripIds.includes(res.tripId));

    // 3. Populate passenger and trip info
    return await Promise.all(
      driverReservations.map(async (res) => {
        const trip = trips.find((t) => t._id === res.tripId);
        const passenger = await ctx.db.get(res.userId);
        const car = trip ? await ctx.db.get(trip.carId) : null;
        const passengerPhotoUrl = passenger?.photoStorageId
          ? await ctx.storage.getUrl(passenger.photoStorageId)
          : null;

        return {
          ...res,
          id: res._id,
          profiles: passenger ? { ...passenger, id: passenger._id, photoUrl: passengerPhotoUrl } : null,
          trips: trip ? {
            ...trip,
            id: trip._id,
            cars: car ? { ...car, id: car._id } : null,
          } : null,
        };
      })
    );
  },
});

export const updateReservationStatus = mutation({
  args: {
    id: v.id("reservations"),
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });

    // If cancelled, return the seats to the trip
    if (args.status === "cancelled") {
      const reservation = await ctx.db.get(args.id);
      if (reservation) {
        const trip = await ctx.db.get(reservation.tripId);
        if (trip) {
          await ctx.db.patch(reservation.tripId, {
            availableSeats: trip.availableSeats + reservation.seats,
          });
        }
      }
    }

    // Create notification for passenger
    const reservation = await ctx.db.get(args.id);
    if (reservation) {
      const trip = await ctx.db.get(reservation.tripId);
      if (trip) {
        const driver = await ctx.db.get(trip.driverId);
        await ctx.db.insert("notifications", {
          userId: reservation.userId,
          title: args.status === "confirmed" ? "Réservation acceptée" : "Réservation annulée",
          message: args.status === "confirmed" 
            ? `Votre trajet de ${trip.departureCity} à ${trip.arrivalCity} est confirmé par ${driver?.name || 'le chauffeur'}.`
            : `Votre réservation pour le trajet ${trip.departureCity} à ${trip.arrivalCity} a été annulée.`,
          type: args.status === "confirmed" ? "reservation_confirmed" : "reservation_cancelled",
          relatedId: args.id,
          isRead: false,
          metadata: {
            from: trip.departureCity,
            to: trip.arrivalCity,
            driverName: driver?.name || 'le chauffeur',
          },
        });
      }
    }

    return await ctx.db.get(args.id);
  },
});
