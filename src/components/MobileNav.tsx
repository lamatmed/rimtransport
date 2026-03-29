"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Calendar, Bell, User } from "lucide-react";
import { authService } from "@/services/authService";
import { useEffect, useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { notificationService } from "@/services/notificationService";

export function MobileNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    authService.getCurrentUser().then(user => {
      setIsLoggedIn(!!user);
      if (user) {
        notificationService.getUserNotifications(user.id).then(notifs => {
          setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
        });
      }
    });
  }, [pathname]);

  const navItems = [
    { label: t('home_tab'), icon: <Home size={22} />, href: "/" },
    { label: t('trips_tab'), icon: <Map size={22} />, href: "/search" },
    { label: t('reservations_tab'), icon: <Calendar size={22} />, href: "/reservations" },
    { label: t('notifications_tab'), icon: <Bell size={22} />, href: "/notifications", badge: unreadCount },
    { label: t('profile_tab'), icon: <User size={22} />, href: isLoggedIn ? "/profile" : "/login" },
  ];

  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <nav className="glass" style={{ 
      position: "fixed", 
      bottom: 0, 
      left: "0", 
      width: "100%", 
      height: "70px", 
      display: "flex", 
      justifyContent: "space-around", 
      alignItems: "center", 
      paddingBottom: "env(safe-area-inset-bottom)",
      zIndex: 1000,
      boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
      background: "white",
      borderTop: "1px solid var(--border-color)"
    }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: "4px",
              color: isActive ? "#06cb31" : "#a19f9f",
              textDecoration: "none",
              transition: "all 0.2s",
              position: "relative",
              flex: 1,
              padding: "10px 0"
            }}
          >
            <div style={{ 
              color: isActive ? "#06cb31" : "#a19f9f",
              transform: isActive ? "scale(1.1)" : "none",
              transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              position: "relative"
            }}>
              {item.icon}
              {item.badge && item.badge > 0 && (
                <div style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-8px",
                  background: "#FF3B30",
                  color: "white",
                  borderRadius: "10px",
                  minWidth: "16px",
                  height: "16px",
                  fontSize: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  fontWeight: "bold",
                  border: "2px solid white"
                }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
            </div>
            <span style={{ 
              fontSize: "0.65rem", 
              fontWeight: isActive ? "700" : "500",
              opacity: isActive ? 1 : 0.7
            }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
