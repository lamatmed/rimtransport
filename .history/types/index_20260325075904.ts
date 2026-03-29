export type UserRole = 'driver' | 'passenger';

export interface Profile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  created_at?: string;
  createdAt?: string;
  _creationTime?: number;
  photoUrl?: string | null;
}

export interface Car {
  id: string;
  driver_id: string;
  brand: string;
  plate_number: string;
  seats: number;
  has_ac?: boolean;
  has_luggage?: boolean;
  has_wifi?: boolean;
  has_music?: boolean;
  is_pet_friendly?: boolean;
  created_at: string;
}

export interface Trip {
  id: string;
  driver_id: string;
  car_id: string;
  departure_city: string;
  arrival_city: string;
  date: string;
  price: number;
  available_seats: number;
  created_at: string;
  // Joins
  profiles?: Profile;
  cars?: Car;
}

export interface Reservation {
  id: string;
  trip_id: string;
  user_id: string;
  seats: number;
  status: 'pending' | 'confirmed' | 'cancelled' ;
  created_at: string;
  // Joins
  trips?: Trip;
  profiles?: Profile;
}
