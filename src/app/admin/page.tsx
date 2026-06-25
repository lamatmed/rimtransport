"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authService } from "@/services/authService";
import { useLanguage } from "@/providers/LanguageProvider";
import { ShieldCheck, User, Image as ImageIcon, CheckCircle2, ChevronLeft, Users, MapPin, ChevronRight } from "lucide-react";

export default function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const pendingDrivers = useQuery(api.profiles.getPendingDrivers);
  const approveDriver = useMutation(api.profiles.approveDriver);

  const pendingTrips = useQuery(api.trips.getPendingTrips);

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

  const handleApproveDriver = async (id: any) => {
    try {
      await approveDriver({ id });
    } catch (error) {
      console.error("Failed to approve driver:", error);
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
    <div className="fade-in" style={{ padding: "2rem 1.25rem", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground)" }}>
          <ChevronLeft size={28} />
        </button>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldCheck color="var(--primary-green)" />
          {t("admin_title")}
        </h1>
      </div>

      {/* Admin Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
        <AdminMenuItem 
          icon={<Users size={24} />} 
          title={t("pending_drivers")} 
          count={pendingDrivers?.length || 0} 
          onClick={() => {}} // Stay on this page
          active={true}
        />
        <AdminMenuItem 
          icon={<MapPin size={24} />} 
          title={t("pending_trips")} 
          count={pendingTrips?.length || 0} 
          onClick={() => router.push("/admin/trips")} 
        />
      </div>

      <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.5rem", color: "var(--text-muted)" }}>
        {t("pending_drivers")} ({pendingDrivers?.length || 0})
      </h2>

      {pendingDrivers === undefined ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
        </div>
      ) : pendingDrivers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
          <CheckCircle2 size={48} color="var(--primary-green)" style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <p style={{ color: "var(--text-muted)" }}>{t("no_pending_drivers")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {pendingDrivers.map((driver) => (
            <div key={driver.id} style={{ background: "var(--card-bg)", borderRadius: "20px", padding: "1.25rem", boxShadow: "var(--shadow-md)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "15px", background: "rgba(0, 169, 92, 0.1)", overflow: "hidden", flexShrink: 0 }}>
                  {driver.photoUrl ? (
                    <img src={driver.photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={driver.name} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User color="var(--primary-green)" />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: "700", fontSize: "1.1rem" }}>{driver.name}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{driver.phone}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{driver.email || "-"}</p>
                </div>
              </div>

              {driver.paymentScreenshotUrl && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ImageIcon size={16} />
                    { t("payment_screenshot")}
                  </p>
                  <a href={driver.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                    <img src={driver.paymentScreenshotUrl} style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--border-color)", cursor: "zoom-in" }} alt="Payment Evidence" />
                  </a>
                </div>
              )}

              <button onClick={() => handleApproveDriver(driver.id)} className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <CheckCircle2 size={20} />
                {t("approve")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminMenuItem({ icon, title, count, onClick, active = false }: any) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "1.25rem", 
        borderRadius: "16px", 
        background: active ? "var(--primary-green)" : "var(--card-bg)",
        color: active ? "white" : "inherit",
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
        border: active ? "none" : "1px solid var(--border-color)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: active ? "rgba(255,255,255,0.2)" : "rgba(0,169,92,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: active ? "white" : "var(--primary-green)" }}>
          {icon}
        </div>
        <div>
          <p style={{ fontWeight: "700", fontSize: "1rem" }}>{title}</p>
          <p style={{ fontSize: "0.75rem", opacity: 0.8 }}>{count} items</p>
        </div>
      </div>
      <ChevronRight size={20} opacity={0.5} />
    </div>
  );
}
