"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notificationService } from "@/services/notificationService";
import { authService } from "@/services/authService";
import { useLanguage } from "@/providers/LanguageProvider";
import { Bell, BellOff, Circle, CheckCircle2, Info, ChevronRight } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t, locale } = useLanguage();

  const mauritaniaGreen = '#00A95C';
  const mauritaniaGold = '#FFD700';

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const data = await notificationService.getUserNotifications(user.id);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: any) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getNotificationTitle = (notification: any) => {
    const { type } = notification;
    switch (type) {
      case 'reservation_requested': return t('notification_res_requested_title');
      case 'reservation_confirmed': return t('notification_res_confirmed_title');
      case 'reservation_cancelled': return t('notification_res_cancelled_title');
      default: return notification.title;
    }
  };

  const getNotificationMessage = (notification: any) => {
    const { type, message, metadata } = notification;
    if (!metadata) return message;

    switch (type) {
      case 'reservation_requested':
        if (metadata.isForPassenger) {
          return t('res_pending_confirm', { 
            from: metadata.from, 
            to: metadata.to 
          });
        }
        return t('notification_res_requested_msg', { 
          name: metadata.name, 
          seats: metadata.seats 
        });
      case 'reservation_confirmed':
        return t('notification_res_confirmed_msg', { 
          from: metadata.from, 
          to: metadata.to 
        });
      case 'reservation_cancelled':
        return t('notification_res_cancelled_msg', { 
          from: metadata.from, 
          to: metadata.to 
        });
      default:
        return message;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reservation_requested': return <Bell size={20} color={mauritaniaGold} />;
      case 'reservation_confirmed': return <CheckCircle2 size={20} color={mauritaniaGreen} />;
      case 'reservation_cancelled': return <Info size={20} color="#FF3B30" />;
      default: return <Bell size={20} color="var(--primary-green)" />;
    }
  };

  return (
    <div className="fade-in" style={{ padding: "1.5rem 1.25rem 6rem 1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "800" }}>{t('notifications_title')}</h1>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={handleMarkAllAsRead}
            style={{ background: "none", border: "none", color: mauritaniaGreen, fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}
          >
            {t('mark_all_read')}
          </button>
        )}
      </div>

      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem", fontWeight: "600" }}>
        {notifications.filter(n => !n.isRead).length} {t('unread_count')}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", opacity: 0.5 }}>
            <BellOff size={48} style={{ margin: "0 auto 1rem" }} />
            <p style={{ fontWeight: "500" }}>{t('no_notifications')}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id} 
              className="card-premium" 
              style={{ 
                padding: "1rem", 
                cursor: "pointer",
                borderLeft: notification.isRead ? "1px solid var(--border-color)" : `4px solid ${mauritaniaGreen}`,
                transition: "all 0.2s"
              }}
              onClick={() => {
                if (!notification.isRead) handleMarkAsRead(notification._id);
                router.push(`/notifications/${notification._id}`);
              }}
            >
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ 
                  width: "44px", 
                  height: "44px", 
                  borderRadius: "12px", 
                  background: notification.isRead ? "rgba(0,0,0,0.05)" : "rgba(0,169,92,0.1)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center" 
                }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: notification.isRead ? "600" : "800" }}>
                      {getNotificationTitle(notification)}
                    </h3>
                    {!notification.isRead && <Circle size={8} fill={mauritaniaGreen} color={mauritaniaGreen} />}
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--foreground)", opacity: 0.9, lineHeight: "1.4", marginBottom: "8px" }}>
                    {getNotificationMessage(notification)}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                    {new Date(notification._creationTime).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <ChevronRight size={18} style={{ color: "var(--border-color)", alignSelf: "center" }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
