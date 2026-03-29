"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  reservationService, 
  mapUserReservationsFromConvex, 
  mapDriverReservationsFromConvex 
} from "@/services/reservationService";
import { authService } from "@/services/authService";
import { useLanguage } from "@/providers/LanguageProvider";
import { Calendar, Clock, CheckCircle2, XCircle, Clock4, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ReservationsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [userRes, setUserRes] = useState<any[]>([]);
  const [driverRes, setDriverRes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'my_bookings' | 'my_passengers'>('my_bookings');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { t, locale } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const p: any = await authService.getProfile(user.id);
      setProfile(p);
      
      // Load reservations
      const uRes = await reservationService.getUserReservations(user.id);
      setUserRes(uRes);
      
      if (p.role === 'driver') {
        const dRes = await reservationService.getDriverReservations(user.id);
        setDriverRes(dRes);
        if (dRes.length > 0 && uRes.length === 0) {
          setActiveTab('my_passengers');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentReservations = activeTab === 'my_bookings' ? userRes : driverRes;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#34C759';
      case 'cancelled': return '#FF3B30';
      default: return '#FF9500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 size={16} color="#34C759" />;
      case 'cancelled': return <XCircle size={16} color="#FF3B30" />;
      default: return <Clock4 size={16} color="#FF9500" />;
    }
  };

  return (
    <div className="fade-in" style={{ padding: "1.5rem 1.25rem 6rem 1.25rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>{t('my_reservations')}</h1>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: "1.4" }}>
        {profile?.role === 'driver'
          ? activeTab === 'my_bookings'
            ? t('res_subtitle_driver_booking')
            : t('res_subtitle_driver_passengers')
          : t('res_subtitle_passenger')}
      </p>

      {profile?.role === 'driver' && (
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", marginBottom: "1.5rem" }}>
          <button 
            onClick={() => setActiveTab('my_bookings')}
            style={{ 
              flex: 1, 
              padding: "1rem", 
              background: "none", 
              border: "none", 
              borderBottom: activeTab === 'my_bookings' ? "3px solid var(--primary-green)" : "none", 
              color: activeTab === 'my_bookings' ? "var(--primary-green)" : "var(--text-muted)",
              fontWeight: activeTab === 'my_bookings' ? "700" : "500",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {t('my_trips')}
          </button>
          <button 
            onClick={() => setActiveTab('my_passengers')}
            style={{ 
              flex: 1, 
              padding: "1rem", 
              background: "none", 
              border: "none", 
              borderBottom: activeTab === 'my_passengers' ? "3px solid var(--primary-green)" : "none", 
              color: activeTab === 'my_passengers' ? "var(--primary-green)" : "var(--text-muted)",
              fontWeight: activeTab === 'my_passengers' ? "700" : "500",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {t('my_passengers')}
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>...</div>
        ) : currentReservations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", opacity: 0.5 }}>
            <Calendar size={48} style={{ margin: "0 auto 1rem" }} />
            <p>{activeTab === 'my_bookings' ? t('no_bookings') : t('no_passengers')}</p>
          </div>
        ) : (
          currentReservations.map((res) => (
            <div key={res.id} className="card-premium" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                <div>
                   <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "4px" }}>
                     {res.trips?.departure_city} → {res.trips?.arrival_city}
                   </h3>
                   <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                     <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                       <Calendar size={12} /> <span>{new Date(res.trips?.date).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}</span>
                     </div>
                     <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                       <Clock size={12} /> <span>{new Date(res.trips?.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     </div>
                   </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "8px", background: `${getStatusColor(res.status)}15`, color: getStatusColor(res.status), fontSize: "0.7rem", fontWeight: "700" }}>
                   {getStatusIcon(res.status)}
                   <span style={{ textTransform: "uppercase" }}>{t(`status_${res.status}`)}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>
                      {activeTab === 'my_bookings' ? t('role_driver') : t('role_passenger')}
                    </p>
                    <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                      {activeTab === 'my_bookings' ? res.trips?.profiles?.name : res.profiles?.name}
                    </p>
                 </div>
                 <div style={{ margin: "0 1.5rem", textAlign: "center" }}>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>{t('place').toUpperCase()}S</p>
                    <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>{res.seats}</p>
                 </div>
                 <Link href={`/trip/${res.trip_id || res.trips?.id || res.trips?._id}`} style={{ color: "var(--primary-green)", fontWeight: "700", fontSize: "0.85rem", textDecoration: "none" }}>
                   {t('view_details')}
                 </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
