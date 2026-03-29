"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { authService } from "@/services/authService";
import { useLanguage } from "@/providers/LanguageProvider";
import { User, MapPin, Calendar, Clock, Users, Search, Plus, ArrowRight, ChevronRight, Navigation } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t, locale } = useLanguage();

  const liveTripsRaw = useQuery(api.trips.listAvailableTrips, {});
  
  const trips = useMemo(() => {
    if (!liveTripsRaw) return [];
    return liveTripsRaw.map((trip: any) => ({
      ...trip,
      id: trip._id,
      driver_id: trip.driverId,
      car_id: trip.carId,
      departure_city: trip.departureCity,
      arrival_city: trip.arrivalCity,
      available_seats: trip.availableSeats,
    })).slice(0, 5);
  }, [liveTripsRaw]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const p = await authService.getProfile(user.id);
        setProfile(p);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('good_morning');
    if (hour < 18) return t('good_afternoon');
    return t('good_evening');
  };

  const formatDate = (dateValue: number) => {
    return new Date(dateValue).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const formatTime = (dateValue: number) => {
    return new Date(dateValue).toLocaleTimeString(locale === 'ar' ? 'ar-MA' : 'fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="fade-in" style={{ padding: "2rem 0 6rem 0" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ 
            width: "60px", 
            height: "60px", 
            borderRadius: "50%", 
            background: "var(--primary-green)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            overflow: "hidden",
            color: "white"
          }}>
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={30} />
            )}
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{getGreeting()}</p>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800" }}>{profile?.name || "..."} 👋</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{t('where_to')}</p>
          </div>
        </div>
        
        {profile?.role === 'driver' && (
          <Link href="/create-trip" className="btn-primary" style={{ width: "50px", height: "50px", borderRadius: "25px", padding: 0 }}>
            <Plus size={24} />
          </Link>
        )}
      </div>

      {/* Search Trigger */}
      <Link href="/search" className="card-premium" style={{ 
        display: "flex", 
        alignItems: "center", 
        padding: "1rem 1.25rem", 
        marginBottom: "2.5rem",
        textDecoration: "none",
        color: "var(--text-muted)",
        gap: "0.75rem"
      }}>
        <Search size={20} />
        <span style={{ flex: 1 }}>{t('search_trip')}</span>
        <ChevronRight size={18} />
      </Link>

      {/* Recent Trips Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.4rem", fontWeight: "800" }}>{t('recent_trips')}</h3>
        <Link href="/search" style={{ color: "var(--primary-green)", fontWeight: "700", textDecoration: "none", fontSize: "0.9rem" }}>
          {t('see_all')}
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {trips.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div style={{ width: "80px", height: "80px", background: "rgba(0, 169, 92, 0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <Search size={40} color="var(--primary-green)" />
            </div>
            <p style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "0.5rem" }}>{t('no_trips_found')}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t('recent_trips_appear_here')}</p>
          </div>
        ) : (
          trips.map((trip: any) => (
            <Link key={trip.id} href={`/trip/${trip.id}`} className="card-premium" style={{ textDecoration: "none", color: "inherit", overflow: "hidden" }}>
              <div style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                    <MapPin size={16} color="var(--primary-green)" />
                    <span style={{ fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{trip.departure_city}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 10px" }}>
                    <div style={{ height: "1px", width: "20px", background: "var(--border-color)" }}></div>
                    <ArrowRight size={16} color="var(--primary-green)" />
                    <div style={{ height: "1px", width: "20px", background: "var(--border-color)" }}></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "flex-end" }}>
                    <Navigation size={16} color="var(--primary-green)" />
                    <span style={{ fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{trip.arrival_city}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <div style={{ background: "rgba(0, 169, 92, 0.1)", padding: "5px", borderRadius: "50%" }}>
                      <Calendar size={14} color="var(--primary-green)" />
                    </div>
                    {formatDate(trip.date)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <div style={{ background: "rgba(0, 169, 92, 0.1)", padding: "5px", borderRadius: "50%" }}>
                      <Clock size={14} color="var(--primary-green)" />
                    </div>
                    {formatTime(trip.date)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <div style={{ background: "rgba(0, 169, 92, 0.1)", padding: "5px", borderRadius: "50%" }}>
                      <Users size={14} color="var(--primary-green)" />
                    </div>
                    {trip.available_seats} {trip.available_seats <= 1 ? t('place') : t('places')}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                  <div>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{t('price_per_person')}</p>
                    <p style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--primary-green)" }}>{trip.price} MRU</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(0, 169, 92, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-green)", fontSize: "0.8rem", fontWeight: "700" }}>
                      {trip.profiles?.name?.charAt(0) || "C"}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>{trip.profiles?.name || t('role_driver')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
