"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");

  useEffect(() => {
    switch (pathname) {
      case "/": setTitle(t('home_tab')); break;
      case "/search": setTitle(t('trips_tab')); break;
      case "/reservations": setTitle(t('reservations_tab')); break;
      case "/notifications": setTitle(t('notifications_tab')); break;
      case "/profile": setTitle(t('profile_tab')); break;
      case "/create-trip": setTitle(t('create_trip')); break;
      case "/my-cars": setTitle(t('my_vehicles')); break;
      case "/login": setTitle(t('login')); break;
      case "/signup": setTitle(t('signup')); break;
      default: 
        if (pathname.startsWith("/trip/")) setTitle(t('trip_details'));
        else setTitle("RimTransport");
    }
  }, [pathname, t]);

  const showBackButton = pathname !== "/" && pathname !== "/search" && pathname !== "/reservations" && pathname !== "/notifications" && pathname !== "/profile";
  const hideHeader = pathname === "/login" || pathname === "/signup";

  if (hideHeader) return null;

  return (
    <header style={{ 
      backgroundColor: "#00A95C", 
      height: "60px", 
      display: "flex", 
      alignItems: "center", 
      padding: "0 16px",
      position: "sticky",
      top: 0,
      zIndex: 1100,
      width: "100%",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <div style={{ width: "40px" }}>
        {showBackButton && (
          <button 
            onClick={() => router.back()} 
            style={{ background: "none", border: "none", cursor: "pointer", color: "#FFD700" }}
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>
      
      <div style={{ flex: 1, textAlign: "center" }}>
        <h1 style={{ 
          color: "#f8f7ef", 
          fontSize: "1.1rem", 
          fontWeight: "bold", 
          margin: 0 
        }}>
          {title}
        </h1>
      </div>
      
      <div style={{ width: "40px" }} />
    </header>
  );
}
