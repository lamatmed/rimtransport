"use client";

import { useLanguage } from "@/providers/LanguageProvider";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { Clock, ShieldAlert, LogOut, Phone } from "lucide-react";

export default function PendingApprovalPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const handleSignOut = async () => {
    await authService.signOut();
    router.replace("/login");
  };

  return (
    <div className="fade-in" style={{ padding: "3rem 1.5rem", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ width: "120px", height: "120px", background: "rgba(0, 169, 92, 0.1)", borderRadius: "60px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem" }}>
        <Clock size={60} color="var(--primary-green)" className="pulse" />
      </div>

      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1rem" }}>{t("pending_approval_title")}</h1>
      
      <div style={{ background: "white", padding: "1.5rem", borderRadius: "20px", boxShadow: "var(--shadow-md)", marginBottom: "2rem", width: "100%", maxWidth: "400px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
          {t("pending_approval_desc")}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(0, 0, 0, 0.03)", padding: "1rem", borderRadius: "12px", textAlign: "left" }}>
          <ShieldAlert size={24} color="var(--primary-green)" />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{t("contact_admin")}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "400px" }}>
        <a href="tel:+22246000000" className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none" }}>
          <Phone size={20} />
          {t("support")}
        </a>

        <button onClick={handleSignOut} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--foreground)", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <LogOut size={20} />
          {t("go_to_login")}
        </button>
      </div>

      <style jsx>{`
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
