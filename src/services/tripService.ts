import { convex } from './convex';
import { api } from '../../convex/_generated/api';

export const tripService = {
  async cleanupPastTrips() {
    return await (convex as any).mutation(api.trips.cleanupPastTrips, {});
  },

  async listTrips(departureCity?: string, arrivalCity?: string) {
    try {
      await this.cleanupPastTrips();
    } catch(e) { /* ignore cleanup errors */ }
    
    const data = await convex.query(api.trips.listAvailableTrips, {
      departureCity,
      arrivalCity,
    });
    
    // Map back for UI parity
    return data.map((trip: any) => ({
      ...trip,
      id: trip._id,
      driver_id: trip.driverId,
      car_id: trip.carId,
      departure_city: trip.departureCity,
      arrival_city: trip.arrivalCity,
      available_seats: trip.availableSeats,
    }));
  },

  async getTripDetails(tripId: any) {
    try {
      await this.cleanupPastTrips();
    } catch(e) { /* ignore cleanup errors */ }

    const trip: any = await convex.query(api.trips.getTripDetails, { id: tripId });
    if (!trip) return null;
    
    return {
      ...trip,
      id: trip._id,
      driver_id: trip.driverId,
      car_id: trip.carId,
      departure_city: trip.departureCity,
      arrival_city: trip.arrivalCity,
      available_seats: trip.availableSeats,
      profiles: trip.profiles ? { ...trip.profiles, id: trip.profiles._id ?? trip.profiles.id } : null,
      cars: trip.cars ? { 
        ...trip.cars, 
        id: trip.cars._id ?? trip.cars.id,
        plate_number: trip.cars.plateNumber,
        has_ac: trip.cars.hasAC,
        has_luggage: trip.cars.hasLuggage,
        has_wifi: trip.cars.hasWifi,
        has_music: trip.cars.hasMusic,
        is_pet_friendly: trip.cars.isPetFriendly,
      } : null,
    };
  },

  async createTrip(trip: any) {
    return await (convex as any).mutation(api.trips.createTrip, {
      driverId: trip.driverId || trip.driver_id,
      carId: trip.carId || trip.car_id,
      departureCity: trip.departureCity || trip.departure_city,
      arrivalCity: trip.arrivalCity || trip.arrival_city,
      date: Number(trip.date),
      price: Number(trip.price),
      availableSeats: Number(trip.availableSeats || trip.available_seats),
    });
  },

  async updateTrip(tripId: any, updates: any) {
    const convexUpdates: any = { id: tripId };
    if (updates.car_id !== undefined) convexUpdates.carId = updates.car_id;
    if (updates.departure_city !== undefined) convexUpdates.departureCity = updates.departure_city;
    if (updates.arrival_city !== undefined) convexUpdates.arrivalCity = updates.arrival_city;
    if (updates.date !== undefined) convexUpdates.date = Number(updates.date);
    if (updates.price !== undefined) convexUpdates.price = Number(updates.price);
    if (updates.available_seats !== undefined) convexUpdates.availableSeats = Number(updates.available_seats);
    
    return await (convex as any).mutation(api.trips.updateTrip, convexUpdates);
  },

  async getDriverTrips(driverId: any) {
    try {
      await this.cleanupPastTrips();
    } catch(e) { /* ignore cleanup errors */ }

    const data = await convex.query(api.trips.getDriverTrips, { driverId });
    return data.map((trip: any) => ({
      ...trip,
      id: trip._id,
      driver_id: trip.driverId,
      car_id: trip.carId,
      departure_city: trip.departureCity,
      arrival_city: trip.arrivalCity,
      available_seats: trip.availableSeats,
    }));
  },

  async deleteTrip(tripId: any, driverId: any) {
    return await (convex as any).mutation(api.trips.deleteTrip, {
      id: tripId,
      driverId,
    });
  }
};
