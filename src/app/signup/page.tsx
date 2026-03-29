"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useLanguage } from "@/providers/LanguageProvider";
import { User, Phone, Mail, Lock, ChevronLeft, UserCircle2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<'passenger' | 'driver'>("passenger");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !name || !phone) {
      setError(t("fill_all_fields"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { user } = await authService.signUp(email || undefined, password, name, phone, role);
      
      if (imageFile) {
        try {
          const uploadUrl = await authService.generateProfilePhotoUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": imageFile.type },
            body: imageFile,
          });
          const { storageId } = await result.json();
          await authService.setProfilePhoto(user.id, storageId);
        } catch (imgError) {
          console.error("Photo upload failed:", imgError);
        }
      }
      
      router.replace("/");
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("Email already registered")) {
        setError(t("email_already_registered"));
      } else if (msg.includes("Phone number already registered")) {
        setError(t("phone_already_registered"));
      } else {
        setError(msg || t("signup_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fade-in" style={{ padding: "2rem 1.25rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground)" }}>
          <ChevronLeft size={28} />
        </button>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setLocale('fr')} style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid", borderColor: locale === 'fr' ? "var(--primary-green)" : "var(--border-color)", background: locale === 'fr' ? "rgba(0, 169, 92, 0.1)" : "transparent", color: locale === 'fr' ? "var(--primary-green)" : "var(--text-muted)", fontWeight: locale === 'fr' ? "700" : "400", cursor: "pointer" }}>FR</button>
          <button onClick={() => setLocale('ar')} style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid", borderColor: locale === 'ar' ? "var(--primary-green)" : "var(--border-color)", background: locale === 'ar' ? "rgba(0, 169, 92, 0.1)" : "transparent", color: locale === 'ar' ? "var(--primary-green)" : "var(--text-muted)", fontWeight: locale === 'ar' ? "700" : "400", cursor: "pointer" }}>AR</button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ width: "80px", height: "80px", margin: "0 auto 1.5rem", background: "white", borderRadius: "20px", boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <img src="/icons/icon-192x192.png" alt="Logo" style={{ width: "100%", height: "100%" }} />
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.5rem" }}>{t("signup_title")}</h1>
        <p style={{ color: "var(--text-muted)" }}>{t("signup_subtitle")}</p>
      </div>

      <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "16px", padding: "6px", marginBottom: "2rem" }}>
        <button 
          onClick={() => setRole('passenger')} 
          style={{ flex: 1, padding: "0.8rem", borderRadius: "12px", border: "none", background: role === 'passenger' ? "var(--primary-green)" : "transparent", color: role === 'passenger' ? "white" : "var(--text-muted)", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
        >
          {t("role_passenger")}
        </button>
        <button 
          onClick={() => setRole('driver')} 
          style={{ flex: 1, padding: "0.8rem", borderRadius: "12px", border: "none", background: role === 'driver' ? "var(--primary-green)" : "transparent", color: role === 'driver' ? "white" : "var(--text-muted)", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
        >
          {t("role_driver")}
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <label style={{ cursor: "pointer", display: "inline-block" }}>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "rgba(0, 169, 92, 0.1)", border: "2px solid var(--primary-green)", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {imagePreview ? (
              <img src={imagePreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <>
                <UserCircle2 size={40} color="var(--primary-green)" />
                <span style={{ fontSize: "0.75rem", color: "var(--primary-green)", fontWeight: "600", marginTop: "4px" }}>{t("add_photo")}</span>
              </>
            )}
          </div>
        </label>
      </div>

      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginLeft: "4px" }}>{t("fullname_label")}</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "var(--card-bg)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <User size={20} color="var(--primary-green)" />
            <input type="text" placeholder={t("fullname_placeholder")} style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "1rem" }} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginLeft: "4px" }}>{t("phone_label")}</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "var(--card-bg)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <Phone size={20} color="var(--primary-green)" />
            <input type="tel" placeholder={t("phone_placeholder")} style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "1rem" }} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginLeft: "4px" }}>{t("email_label")}</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "var(--card-bg)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <Mail size={20} color="var(--primary-green)" />
            <input type="email" placeholder={t("email_placeholder")} style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "1rem" }} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginLeft: "4px" }}>{t("password_label")}</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "var(--card-bg)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <Lock size={20} color="var(--primary-green)" />
            <input type="password" placeholder={t("password_placeholder")} style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "1rem" }} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(210, 16, 52, 0.1)", color: "var(--error)", padding: "0.8rem", borderRadius: "10px", fontSize: "0.85rem", textAlign: "center", fontWeight: "600" }}>
            {error}
          </div>
        )}

        <button className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "1rem" }}>
          {loading ? "..." : t("create_account_btn")}
        </button>

        <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.95rem", display: "flex", justifyContent: "center", gap: "4px", marginBottom: "2rem" }}>
          <span style={{ color: "var(--text-muted)" }}>{t("already_have_account")}</span>
          <Link href="/login" style={{ color: "var(--primary-green)", fontWeight: "700", textDecoration: "none" }}>
            {t("login_link")}
          </Link>
        </div>
      </form>
    </div>
  );
}
