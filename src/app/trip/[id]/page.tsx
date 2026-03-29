"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { tripService } from "@/services/tripService";
import { reservationService } from "@/services/reservationService";
import { authService } from "@/services/authService";
import { useLanguage } from "@/providers/LanguageProvider";
import { MapPin, Calendar, Clock, Car, User, Users, Phone, CheckCircle, Wind, Briefcase, Wifi, Music, PawPrint, X, ChevronRight } from "lucide-react";

export default function TripDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, locale } = useLanguage();
  
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [requestedSeats, setRequestedSeats] = useState(1);
  const [reservations, setReservations] = useState<any[]>([]);
  const [tripPassengerBookings, setTripPassengerBookings] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCarDetails, setShowCarDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      const data = await tripService.getTripDetails(id as string);
      setTrip(data);
      
      if (user && data && String(user.id) === String(data.driver_id)) {
        const res = await reservationService.getTripReservations(id as string);
        setReservations(res);
      }

      if (user && data && String(user.id) !== String(data.driver_id)) {
        const bookings = await reservationService.getTripReservations(id as string);
        setTripPassengerBookings(bookings.filter((r: any) => r.status !== 'cancelled'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (resId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await reservationService.updateReservationStatus(resId, status);
      loadData();
    } catch (e: any) {
      alert(e.message || t('update_res_failed'));
    }
  };

  const handleReserve = async () => {
    if (!currentUser) {
      alert(t('login_to_reserve'));
      router.push('/login');
      return;
    }
    
    if (confirm(t('confirm_res_msg', { seats: requestedSeats, price: trip?.price * requestedSeats }))) {
      setReserving(true);
      try {
        await reservationService.reserveSeats({
          trip_id: trip?.id,
          user_id: currentUser.id,
          seats: requestedSeats,
        });
        alert(t('res_pending_confirm', { from: trip?.departure_city, to: trip?.arrival_city }));
        router.push('/');
      } catch (e: any) {
        alert(e.message || t('res_failed'));
      } finally {
        setReserving(false);
      }
    }
  };

  const handleDeleteTrip = async () => {
    if (confirm(t('delete_trip_confirm'))) {
      try {
        await tripService.deleteTrip(trip.id, currentUser.id);
        router.replace('/');
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  if (loading) return <div className="centered" style={{ padding: "4rem" }}>...</div>;
  if (!trip) return <div className="centered" style={{ padding: "4rem" }}>{t('trip_not_found')}</div>;

  const isDriver = String(currentUser?.id) === String(trip.driver_id);

  return (
    <div className="fade-in">
      {/* Route Card */}
      <div className="card-premium" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <MapPin size={24} color="var(--primary-green)" />
            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{t('departure')}</p>
              <p style={{ fontSize: "1.25rem", fontWeight: "800" }}>{trip.departure_city}</p>
            </div>
          </div>
          <div style={{ width: "2px", height: "30px", background: "var(--border-color)", marginLeft: "11px" }} />
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <CheckCircle size={24} color="#34C759" />
            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{t('arrival')}</p>
              <p style={{ fontSize: "1.25rem", fontWeight: "800" }}>{trip.arrival_city}</p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ textAlign: "center" }}>
            <Calendar size={20} color="var(--primary-green)" style={{ margin: "0 auto 8px" }} />
            <p style={{ fontWeight: "700", fontSize: "0.9rem" }}>{new Date(trip.date).toLocaleDateString()}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{t('date')}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Clock size={20} color="var(--primary-green)" style={{ margin: "0 auto 8px" }} />
            <p style={{ fontWeight: "700", fontSize: "0.9rem" }}>{new Date(trip.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{t('time')}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Users size={20} color="var(--primary-green)" style={{ margin: "0 auto 8px" }} />
            <p style={{ fontWeight: "700", fontSize: "0.9rem" }}>{trip.available_seats}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{t('remaining_seats')}</p>
          </div>
        </div>
      </div>

      {/* Reservation Section */}
      {!isDriver && (
        <div className="card-premium" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={20} color="var(--primary-green)" /> {t('reserve_seats_title')}
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "600" }}>{t('num_travelers')}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <button 
                onClick={() => setRequestedSeats(Math.max(1, requestedSeats - 1))}
                style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--border-color)", background: "white", fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                disabled={requestedSeats <= 1}
              >-</button>
              <span style={{ fontSize: "1.25rem", fontWeight: "800" }}>{requestedSeats}</span>
              <button 
                onClick={() => setRequestedSeats(Math.min(trip.available_seats, requestedSeats + 1))}
                style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--border-color)", background: "white", fontSize: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                disabled={requestedSeats >= trip.available_seats}
              >+</button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Info */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1rem", marginLeft: "4px" }}>{t('driver_info')}</h3>
      <div className="card-premium" style={{ padding: "1.25rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "28px", background: "var(--primary-green)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", color: "white" }}>
          {trip.profiles?.photoUrl ? (
            <img src={trip.profiles.photoUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <User size={30} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: "700", fontSize: "1.1rem" }}>{trip.profiles?.name}</p>
          <a href={`tel:${trip.profiles?.phone}`} style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--primary-green)", fontSize: "0.9rem", textDecoration: "none", marginTop: "4px", fontWeight: "600" }}>
            <Phone size={14} /> {trip.profiles?.phone}
          </a>
        </div>
      </div>

      {/* Vehicle Info */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1rem", marginLeft: "4px" }}>{t('vehicle_info')}</h3>
      <div className="card-premium" onClick={() => setShowCarDetails(true)} style={{ padding: "1.25rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}>
        <Car size={24} color="var(--primary-green)" />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: "700" }}>{trip.cars?.brand}</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{trip.cars?.plate_number}</p>
        </div>
        <ChevronRight size={20} color="var(--text-muted)" />
      </div>

      {/* Driver View: Reservations */}
      {isDriver && (
        <>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1rem", marginLeft: "4px" }}>{t('passenger_res')}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reservations.length === 0 ? (
              <div className="card-premium" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>{t('no_res_for_trip')}</div>
            ) : (
              reservations.map((res) => (
                <div key={res.id} className="card-premium" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "16px", background: "rgba(0,169,92,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-green)", fontWeight: "700" }}>{res.profiles?.name?.charAt(0)}</div>
                      <div>
                        <p style={{ fontWeight: "700" }}>{res.profiles?.name}</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{res.seats} {t('places')}</p>
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: "0.7rem", 
                      fontWeight: "800", 
                      padding: "4px 8px", 
                      borderRadius: "6px",
                      background: res.status === 'confirmed' ? "rgba(52, 199, 89, 0.1)" : "rgba(255, 149, 0, 0.1)",
                      color: res.status === 'confirmed' ? "#34C759" : "#FF9500"
                    }}>
                      {res.status.toUpperCase()}
                    </span>
                  </div>
                  {res.status === 'pending' && (
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button onClick={() => handleUpdateStatus(res.id, 'confirmed')} className="btn-primary" style={{ flex: 1, padding: "0.6rem", fontSize: "0.85rem" }}>{t('accept')}</button>
                      <button onClick={() => handleUpdateStatus(res.id, 'cancelled')} className="btn-primary" style={{ flex: 1, padding: "0.6rem", fontSize: "0.85rem", background: "var(--error)" }}>{t('refuse')}</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Action Bar (at bottom of content) */}
      <div className="card-premium" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem" }}>
        <div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{t('total_price')}</p>
          <p style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--primary-green)" }}>{trip.price * (isDriver ? 1 : requestedSeats)} MRU</p>
        </div>
        {!isDriver ? (
          <button className="btn-primary" onClick={handleReserve} disabled={reserving || trip.available_seats === 0} style={{ padding: "1rem 2rem" }}>
            {reserving ? "..." : t('reserve_now')}
          </button>
        ) : (
          <button className="btn-primary" onClick={handleDeleteTrip} style={{ background: "var(--error)", padding: "1rem 2rem" }}>
            {t('delete')}
          </button>
        )}
      </div>

      {/* Vehicle Details Modal */}
      {showCarDetails && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end" }}>
          <div className="fade-in" style={{ width: "100%", maxWidth: "600px", margin: "0 auto", background: "white", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", padding: "2rem 2rem 100px 2rem", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800" }}>{t('vehicle_details')}</h2>
              <button onClick={() => setShowCarDetails(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X /></button>
            </div>
            
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
               <div style={{ width: "80px", height: "80px", borderRadius: "40px", background: "rgba(0, 169, 92, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                  <Car size={32} color="var(--primary-green)" />
               </div>
               <h3 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{trip.cars?.brand}</h3>
               <p style={{ color: "var(--text-muted)", fontWeight: "600" }}>{trip.cars?.plate_number}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
               <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>{t('equipments_options')}</h4>
               <FeatureRow icon={<Wind size={18}/>} label={t('air_conditioner')} active={trip.cars?.has_ac} />
               <FeatureRow icon={<Briefcase size={18}/>} label={t('luggage_comp')} active={trip.cars?.has_luggage} />
               <FeatureRow icon={<Wifi size={18}/>} label={t('wifi_onboard')} active={trip.cars?.has_wifi} />
               <FeatureRow icon={<Music size={18}/>} label={t('audio_system')} active={trip.cars?.has_music} />
               <FeatureRow icon={<PawPrint size={18}/>} label={t('pets_allowed')} active={trip.cars?.is_pet_friendly} />
            </div>

            <button onClick={() => setShowCarDetails(false)} className="btn-primary" style={{ width: "100%", marginTop: "2rem" }}>{t('close')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureRow({ icon, label, active }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", opacity: active ? 1 : 0.4 }}>
       <div style={{ color: active ? "var(--primary-green)" : "inherit" }}>{icon}</div>
       <span style={{ flex: 1, fontWeight: "500" }}>{label}</span>
       {active && <CheckCircle size={18} color="var(--primary-green)" />}
    </div>
  );
}
