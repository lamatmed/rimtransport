import { convex } from './convex';
import { api } from '../../convex/_generated/api';

export function mapUserReservationFromConvex(res: any) {
  return {
    ...res,
    id: res._id ?? res.id,
    trip_id: res.tripId,
    user_id: res.userId,
    trips: res.trips
      ? {
          ...res.trips,
          id: res.trips._id ?? res.trips.id,
          driver_id: res.trips.driverId,
          car_id: res.trips.carId,
          departure_city: res.trips.departureCity,
          arrival_city: res.trips.arrivalCity,
          available_seats: res.trips.availableSeats,
        }
      : null,
  };
}

export function mapUserReservationsFromConvex(data: any[]) {
  return data.map(mapUserReservationFromConvex);
}

export function mapDriverReservationFromConvex(res: any) {
  return {
    ...res,
    id: res._id ?? res.id,
    trip_id: res.tripId,
    user_id: res.userId,
    profiles: res.profiles ? { ...res.profiles, id: res.profiles._id ?? res.profiles.id } : null,
    trips: res.trips
      ? {
          ...res.trips,
          id: res.trips._id ?? res.trips.id,
          departure_city: res.trips.departureCity,
          arrival_city: res.trips.arrivalCity,
          available_seats: res.trips.availableSeats,
          car_id: res.trips.carId,
        }
      : null,
  };
}

export function mapDriverReservationsFromConvex(data: any[]) {
  return data.map(mapDriverReservationFromConvex);
}

export const reservationService = {
  async reserveSeats(reservation: any) {
    return await (convex as any).mutation(api.reservations.reserveSeats, {
      tripId: reservation.tripId || reservation.trip_id,
      userId: reservation.userId || reservation.user_id,
      seats: Number(reservation.seats),
    });
  },

  async getUserReservations(userId: any) {
    const data = await convex.query(api.reservations.getUserReservations, { userId });
    return mapUserReservationsFromConvex(data);
  },

  async getTripReservations(tripId: any) {
    const data = await convex.query(api.reservations.getTripReservations, { tripId });
    return data.map((res: any) => ({
      ...res,
      id: res._id ?? res.id,
      trip_id: res.tripId,
      user_id: res.userId,
      profiles: res.profiles ? { ...res.profiles, id: res.profiles._id ?? res.profiles.id } : null,
    }));
  },

  async getDriverReservations(driverId: any) {
    const data = await convex.query(api.reservations.getDriverReservations, { driverId });
    return mapDriverReservationsFromConvex(data);
  },

  async updateReservationStatus(reservationId: any, status: 'confirmed' | 'cancelled') {
    return await (convex as any).mutation(api.reservations.updateReservationStatus, {
      id: reservationId,
      status,
    });
  }
};
