"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { notificationService } from "@/services/notificationService";
import { useLanguage } from "@/providers/LanguageProvider";
import { Bell, MapPin, User, ChevronRight, ChevronLeft } from "lucide-react";

export default function NotificationDetailScreen() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { t, locale } = useLanguage();

  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mauritaniaGreen = '#00A95C';

  useEffect(() => {
    if (id) {
      loadNotification();
    }
  }, [id]);

  const loadNotification = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotificationById(id);
      setNotification(data);
      if (data && !data.isRead) {
        await notificationService.markAsRead(id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationTitle = (notif: any) => {
    switch (notif.type) {
      case 'reservation_requested': return t('notification_res_requested_title');
      case 'reservation_confirmed': return t('notification_res_confirmed_title');
      case 'reservation_cancelled': return t('notification_res_cancelled_title');
      default: return notif.title;
    }
  };

  const getNotificationMessage = (notif: any) => {
    const { type, message, metadata } = notif;
    if (!metadata) return message;

    switch (type) {
      case 'reservation_requested':
        if (metadata.isForPassenger) {
          return t('res_pending_confirm', { from: metadata.from, to: metadata.to });
        }
        return t('notification_res_requested_msg', { name: metadata.name, seats: metadata.seats });
      case 'reservation_confirmed':
        return t('notification_res_confirmed_msg', { from: metadata.from, to: metadata.to });
      case 'reservation_cancelled':
        return t('notification_res_cancelled_msg', { from: metadata.from, to: metadata.to });
      default: return message;
    }
  };

  if (loading) {
    return (
      <div className="fade-in" style={{ padding: "1.5rem 1.25rem 6rem 1.25rem", textAlign: "center", marginTop: "4rem" }}>
         <div style={{ display: "inline-block", padding: "1rem", borderRadius: "50%", background: "rgba(0,169,92,0.1)" }}>
           <Bell size={32} color={mauritaniaGreen} style={{ opacity: 0.5 }} />
         </div>
         <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: "500" }}>Chargement...</p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="fade-in" style={{ padding: "1.5rem 1.25rem 6rem 1.25rem", textAlign: "center", marginTop: "4rem" }}>
         <p style={{ color: "var(--text-muted)", fontWeight: "500" }}>Notification introuvable</p>
         <button onClick={() => router.back()} style={{ marginTop: "1rem", color: mauritaniaGreen, fontWeight: "600", background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}>
           {t('back')}
         </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: "1.5rem 1.25rem 6rem 1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
        <button 
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600", cursor: "pointer", padding: "0" }}
        >
          <ChevronLeft size={24} color={mauritaniaGreen} />
          <span style={{ fontSize: "1.25rem" }}>{t('notification_details_title')}</span>
        </button>
      </div>

      <div style={{ textAlign: "center", margin: "2rem 0" }}>
        <div style={{ 
          width: "80px", 
          height: "80px", 
          borderRadius: "40px", 
          backgroundColor: `${mauritaniaGreen}15`, 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          margin: "0 auto"
        }}>
          <Bell size={40} color={mauritaniaGreen} />
        </div>
      </div>

      <div className="card-premium" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", textAlign: "center", marginBottom: "0.5rem" }}>
          {getNotificationTitle(notification)}
        </h2>
        
        <p style={{ fontSize: "0.85rem", textAlign: "center", color: "var(--text-muted)", fontWeight: "500", marginBottom: "1.5rem" }}>
          {new Date(notification._creationTime).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>

        <div style={{ height: "1px", width: "100%", backgroundColor: "var(--border-color)", opacity: 0.5, marginBottom: "1.5rem" }} />

        <p style={{ fontSize: "1rem", lineHeight: "1.5", textAlign: "center", color: "var(--foreground)", marginBottom: "2rem", fontWeight: "500" }}>
          {getNotificationMessage(notification)}
        </p>

        {notification.metadata && (Object.keys(notification.metadata).length > 0) && (
          <div style={{ backgroundColor: "var(--card-bg-secondary, rgba(0,0,0,0.02))", padding: "1.25rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid var(--border-color)" }}>
            {notification.metadata.from && notification.metadata.to && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: notification.metadata.name ? "1rem" : "0" }}>
                <MapPin size={20} color={mauritaniaGreen} />
                <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--foreground)" }}>
                  {notification.metadata.from} → {notification.metadata.to}
                </span>
              </div>
            )}
            {notification.metadata.name && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <User size={20} color={mauritaniaGreen} />
                <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--foreground)" }}>
                  {notification.metadata.name}
                </span>
              </div>
            )}
          </div>
        )}

        {notification.relatedId && (
          <button 
            onClick={() => router.push('/reservations')}
            className="btn-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "1rem", borderRadius: "12px", fontSize: "1.05rem", fontWeight: "700", border: 'none', cursor: 'pointer', backgroundColor: mauritaniaGreen, color: 'white' }}
          >
            {t('view_reservation')}
            <ChevronRight size={20} color="white" />
          </button>
        )}
      </div>
    </div>
  );
}
