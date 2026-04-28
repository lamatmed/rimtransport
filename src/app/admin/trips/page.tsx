"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { authService } from "@/services/authService";
import { useLanguage } from "@/providers/LanguageProvider";
import { ShieldCheck, User, Image as ImageIcon, CheckCircle2, ChevronLeft, MapPin } from "lucide-react";

export default function AdminTripsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const pendingTrips = useQuery(api.trips.getPendingTrips);
  const approveTrip = useMutation(api.trips.approveTrip);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await authService.getCurrentUser();
      if (user && user.email === "admin@gmail.mr") {
        setIsAdmin(true);
      } else {
        router.replace("/");
      }
      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  const handleApproveTrip = async (id: any) => {
    try {
      await approveTrip({ id });
    } catch (error) {
      console.error("Failed to approve trip:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="fade-in" style={{ padding: "2rem 1.25rem", minHeight: "100vh", paddingBottom: "6rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground)" }}>
          <ChevronLeft size={28} />
        </button>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldCheck color="var(--primary-green)" />
          {t("pending_trips")}
        </h1>
      </div>

      <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.5rem", color: "var(--text-muted)" }}>
        {t("pending_trips")} ({pendingTrips?.length || 0})
      </h2>

      {pendingTrips === undefined ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
        </div>
      ) : pendingTrips.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
          <CheckCircle2 size={48} color="var(--primary-green)" style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <p style={{ color: "var(--text-muted)" }}>{t("no_pending_trips")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {pendingTrips.map((trip) => (
            <div key={trip.id} style={{ background: "var(--card-bg)", borderRadius: "20px", padding: "1.25rem", boxShadow: "var(--shadow-md)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                 <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                   <div style={{ background: "rgba(0,169,92,0.1)", padding: "10px", borderRadius: "12px" }}>
                      <MapPin size={24} color="var(--primary-green)" />
                   </div>
                   <div>
                     <h3 style={{ fontWeight: "800", fontSize: "1.1rem" }}>{trip.departureCity} → {trip.arrivalCity}</h3>
                     <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{new Date(trip.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                   </div>
                 </div>
                 <div style={{ textAlign: "right" }}>
                   <p style={{ fontWeight: "900", color: "var(--primary-green)", fontSize: "1.2rem" }}>{trip.price} MRU</p>
                   <div style={{ display: "inline-block", background: "rgba(255,215,0,0.15)", color: "#B8860B", padding: "2px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700", marginTop: "4px" }}>
                      Fee: {trip.feeAmount} MRU
                   </div>
                 </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,0,0,0.03)", padding: "0.8rem", borderRadius: "12px", marginBottom: "1.25rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary-green)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <User size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: "700" }}>{trip.profiles?.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{trip.profiles?.phone}</p>
                </div>
              </div>

              {trip.paymentScreenshotUrl && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <ImageIcon size={18} color="var(--primary-green)" />
                    {t("payment_screenshot")}
                  </p>
                  <a href={trip.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                    <img src={trip.paymentScreenshotUrl} style={{ width: "100%", height: "auto", display: "block" }} alt="Trip Payment Proof" />
                  </a>
                </div>
              )}

              <button onClick={() => handleApproveTrip(trip.id)} className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", height: "55px", fontSize: "1rem", fontWeight: "700" }}>
                <CheckCircle2 size={24} />
                {t("approve")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
