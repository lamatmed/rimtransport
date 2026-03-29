import { convex } from './convex';
import { api } from '../../convex/_generated/api';

export const carService = {
  async getDriverCars(driverId: any) {
    const cars = await convex.query(api.cars.getDriverCars, { driverId });
    // Map back to snake_case for UI compatibility
    return cars.map((car: any) => ({
      ...car,
      id: car._id,
      driver_id: car.driverId,
      plate_number: car.plateNumber,
      has_ac: car.hasAC,
      has_luggage: car.hasLuggage,
      has_wifi: car.hasWifi,
      has_music: car.hasMusic,
      is_pet_friendly: car.isPetFriendly,
    }));
  },

  async createCar(car: any) {
    return await (convex as any).mutation(api.cars.createCar, {
      driverId: car.driverId || car.driver_id,
      brand: car.brand,
      plateNumber: car.plateNumber || car.plate_number,
      seats: Number(car.seats),
      hasAC: car.has_ac ?? car.hasAC ?? false,
      hasLuggage: car.has_luggage ?? car.hasLuggage ?? false,
      hasWifi: car.has_wifi ?? car.hasWifi ?? false,
      hasMusic: car.has_music ?? car.hasMusic ?? false,
      isPetFriendly: car.is_pet_friendly ?? car.isPetFriendly ?? false,
    });
  },

  async updateCar(carId: any, updates: any) {
    const convexUpdates: any = { id: carId };
    if (updates.brand !== undefined) convexUpdates.brand = updates.brand;
    if (updates.plate_number !== undefined) convexUpdates.plateNumber = updates.plate_number;
    if (updates.seats !== undefined) convexUpdates.seats = Number(updates.seats);
    if (updates.has_ac !== undefined) convexUpdates.hasAC = updates.has_ac;
    if (updates.has_luggage !== undefined) convexUpdates.hasLuggage = updates.has_luggage;
    if (updates.has_wifi !== undefined) convexUpdates.hasWifi = updates.has_wifi;
    if (updates.has_music !== undefined) convexUpdates.hasMusic = updates.has_music;
    if (updates.is_pet_friendly !== undefined) convexUpdates.isPetFriendly = updates.is_pet_friendly;
    
    return await (convex as any).mutation(api.cars.updateCar, convexUpdates);
  },
  
  async deleteCar(carId: any) {
    return await (convex as any).mutation(api.cars.deleteCar, { id: carId });
  }
};
