"use client";

import { useLanguage } from "@/providers/LanguageProvider";
import { Info, ShieldCheck, ExternalLink, Phone, MessageCircle, Mail, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const { t } = useLanguage();
  const supportNumber = '0022230572816';
  const mauritaniaGreen = '#00A95C';
  const mauritaniaGold = '#FFD700';

  const handleCall = () => { window.open(`tel:${supportNumber}`, "_self"); };
  const handleWhatsApp = () => { window.open(`https://wa.me/${supportNumber}`, "_blank"); };

  return (
    <div className="fade-in" style={{ padding: "1.5rem 0 6rem 0" }}>
      <div style={{ marginBottom: "2rem", padding: "0 4px" }}>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>RimTransport Support Center</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Definition */}
        <div className="card-premium" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
             <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0,169,92,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Info size={22} color={mauritaniaGreen} />
             </div>
             <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: mauritaniaGreen }}>{t('app_definition_title')}</h3>
          </div>
          <p style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "var(--foreground)", opacity: 0.9 }}>{t('app_definition_text')}</p>
        </div>

        {/* How it works */}
        <div style={{ marginLeft: "4px" }}>
           <h3 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{t('how_it_works_title')}</h3>
           <div style={{ width: "40px", height: "4px", background: mauritaniaGold, borderRadius: "2px", marginTop: "4px" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
           <div className="card-premium" style={{ padding: "1.5rem" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0,169,92,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <ShieldCheck size={22} color={mauritaniaGreen} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: mauritaniaGreen }}>{t('role_passenger')}</h3>
             </div>
             <p style={{ fontSize: "0.90rem", lineHeight: "1.6" }}>{t('how_it_works_passenger')}</p>
           </div>

           <div className="card-premium" style={{ padding: "1.5rem" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0,169,92,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <ExternalLink size={22} color={mauritaniaGreen} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: mauritaniaGreen }}>{t('role_driver')}</h3>
             </div>
             <p style={{ fontSize: "0.90rem", lineHeight: "1.6" }}>{t('how_it_works_driver')}</p>
           </div>
        </div>

        {/* Contact Support */}
        <div style={{ marginLeft: "4px", marginTop: "1rem" }}>
           <h3 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{t('contact_support_title')}</h3>
           <div style={{ width: "40px", height: "4px", background: mauritaniaGold, borderRadius: "2px", marginTop: "4px" }} />
        </div>

        <div className="card-premium" style={{ padding: "2rem", textAlign: "center" }}>
           <p style={{ fontSize: "1rem", fontWeight: "500", marginBottom: "2rem", lineHeight: "1.5" }}>{t('contact_support_text')}</p>
           
           <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem" }}>
              <button 
                onClick={handleCall}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: mauritaniaGreen, color: "white", padding: "14px", borderRadius: "18px", border: "none", fontWeight: "700", cursor: "pointer" }}
              >
                <div style={{ width: "28px", height: "28px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <Phone size={18} color={mauritaniaGreen} />
                </div>
                {t('call')}
              </button>

              <button 
                onClick={handleWhatsApp}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#25D366", color: "white", padding: "14px", borderRadius: "18px", border: "none", fontWeight: "700", cursor: "pointer" }}
              >
                <div style={{ width: "28px", height: "28px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <MessageCircle size={18} color="#25D366" />
                </div>
                {t('whatsapp')}
              </button>
           </div>

           <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "1rem", border: "1px dashed rgba(0,169,92,0.4)", borderRadius: "14px", color: "var(--foreground)" }}>
              <Mail size={18} color={mauritaniaGreen} />
              <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>support@rimtransport.mr</span>
           </div>
        </div>
      </div>
    </div>
  );
}
