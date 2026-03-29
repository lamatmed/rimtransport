"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useLanguage } from "@/providers/LanguageProvider";
import { Phone, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError(t("fill_all_fields"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.signIn(phone, password);
      router.replace("/");
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("Invalid phone or password")) {
        setError(t("invalid_credentials"));
      } else {
        setError(msg || t("invalid_credentials"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: "2rem 1.25rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Language Selector */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "2rem" }}>
        <button 
          onClick={() => setLocale('fr')} 
          style={{ 
            padding: "0.4rem 0.8rem", 
            borderRadius: "8px", 
            border: "1px solid", 
            borderColor: locale === 'fr' ? "var(--primary-green)" : "var(--border-color)",
            background: locale === 'fr' ? "rgba(0, 169, 92, 0.1)" : "transparent",
            color: locale === 'fr' ? "var(--primary-green)" : "var(--text-muted)",
            fontWeight: locale === 'fr' ? "700" : "400",
            cursor: "pointer"
          }}
        >
          FR
        </button>
        <button 
          onClick={() => setLocale('ar')} 
          style={{ 
            padding: "0.4rem 0.8rem", 
            borderRadius: "8px", 
            border: "1px solid", 
            borderColor: locale === 'ar' ? "var(--primary-green)" : "var(--border-color)",
            background: locale === 'ar' ? "rgba(0, 169, 92, 0.1)" : "transparent",
            color: locale === 'ar' ? "var(--primary-green)" : "var(--text-muted)",
            fontWeight: locale === 'ar' ? "700" : "400",
            cursor: "pointer"
          }}
        >
          AR
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ 
          width: "80px", 
          height: "80px", 
          margin: "0 auto 1.5rem", 
          background: "white", 
          borderRadius: "20px", 
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}>
          <img src="/icons/icon-192x192.png" alt="Logo" style={{ width: "100%", height: "100%" }} />
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>{t("login_title")}</h1>
        <p style={{ color: "var(--text-muted)" }}>{t("login_subtitle")}</p>
      </div>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginLeft: "4px" }}>{t("phone_label")}</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "var(--card-bg)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <Phone size={20} color="var(--primary-green)" />
            <input 
              type="tel" 
              placeholder={t("phone_placeholder")} 
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "1rem" }} 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginLeft: "4px" }}>{t("password_label")}</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "var(--card-bg)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <Lock size={20} color="var(--primary-green)" />
            <input 
              type="password" 
              placeholder={t("password_placeholder")} 
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "1rem" }} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(210, 16, 52, 0.1)", color: "var(--error)", padding: "0.8rem", borderRadius: "10px", fontSize: "0.85rem", textAlign: "center", fontWeight: "600" }}>
            {error}
          </div>
        )}

        <button 
          type="button" 
          style={{ alignSelf: "flex-end", color: "var(--primary-green)", fontWeight: "600", fontSize: "0.85rem", background: "none", border: "none", cursor: "pointer" }}
        >
          {t("forgot_password")}
        </button>

        <button className="btn-primary" disabled={loading} style={{ width: "100%" }}>
          {loading ? "..." : t("login_btn")}
        </button>

        <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.95rem", display: "flex", justifyContent: "center", gap: "4px" }}>
          <span style={{ color: "var(--text-muted)" }}>{t("no_account")}</span>
          <Link href="/signup" style={{ color: "var(--primary-green)", fontWeight: "700", textDecoration: "none" }}>
            {t("signup_link")}
          </Link>
        </div>
      </form>
    </div>
  );
}
