"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tripService } from "@/services/tripService";
import { useLanguage } from "@/providers/LanguageProvider";
import { MapPin, Calendar, Clock, Users, Search, Filter, ArrowRight, Navigation } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const router = useRouter();
  const { t, locale } = useLanguage();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.listTrips(departure, arrival);
      setTrips(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTrips();
  };

  return (
    <div className="fade-in" style={{ padding: "1.5rem 0 6rem 0" }}>
      {/* Filter Card */}
      <div className="card-premium" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
          <Filter size={18} color="var(--text-muted)" />
          <h2 style={{ fontSize: "1rem", fontWeight: "700" }}>{t('filter_trips')}</h2>
        </div>
        
        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <input 
                type="text" 
                placeholder={t('departure')} 
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--background)", outline: "none", fontSize: "0.9rem" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <input 
                type="text" 
                placeholder={t('arrival')} 
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--background)", outline: "none", fontSize: "0.9rem" }}
              />
            </div>
          </div>
          
          <button type="submit" className="btn-primary" style={{ height: "48px", borderRadius: "12px", width: "100%" }}>
            <Search size={20} />
            <span>{t('search_btn')}</span>
          </button>
        </form>
      </div>

      {/* Results List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>...</div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", opacity: 0.5 }}>
            <Search size={48} style={{ margin: "0 auto 1rem" }} />
            <p style={{ fontWeight: "600" }}>{t('no_trips_available')}</p>
          </div>
        ) : (
          trips.map((trip) => (
            <Link key={trip.id} href={`/trip/${trip.id}`} className="card-premium" style={{ textDecoration: "none", color: "inherit", overflow: "hidden" }}>
              <div style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                       <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary-green)" }} />
                       <span style={{ fontWeight: "800", fontSize: "1.1rem" }}>{trip.departure_city}</span>
                    </div>
                    <div style={{ width: "2px", height: "20px", background: "var(--border-color)", marginLeft: "3px", margin: "2px 0" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34C759" }} />
                       <span style={{ fontWeight: "800", fontSize: "1.1rem" }}>{trip.arrival_city}</span>
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,169,92,0.1)", padding: "6px 12px", borderRadius: "10px", textAlign: "right" }}>
                    <p style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--primary-green)" }}>{trip.price} MRU</p>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <Calendar size={14} />
                    {new Date(trip.date).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <Clock size={14} />
                    {new Date(trip.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <Users size={14} />
                    {trip.available_seats} {trip.available_seats <= 1 ? t('place') : t('places')}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#8E8E93", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: "700" }}>
                    {trip.profiles?.name?.charAt(0) || "C"}
                  </div>
                  <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--foreground)" }}>{trip.profiles?.name || t('role_driver')}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
