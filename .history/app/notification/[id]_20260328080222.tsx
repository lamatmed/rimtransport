import { StyleSheet, TouchableOpacity, useColorScheme, ActivityIndicator, ScrollView } from 'react-native';
import { Text, View, SafeAreaView } from '../../components/Themed';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import Colors from '../../constants/Colors';
import { LanguageService } from '../../services/i18n';
import { useLanguage } from '../_layout';
import { Bell, Calendar, ChevronLeft, MapPin, User, ChevronRight } from 'lucide-react-native';

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { locale } = useLanguage();
  const { t } = LanguageService;
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];

  const notification = useQuery(api.notifications.getNotificationById, { id: id as Id<'notifications'> });
  const markAsRead = useMutation(api.notifications.markAsRead);

  const mauritaniaGreen = '#00A95C';
  const mauritaniaGold = '#FFD700';

  // Mark as read when opened
  if (notification && !notification.isRead) {
    markAsRead({ id: notification._id });
  }

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

  if (!notification) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={mauritaniaGreen} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerTitle: t('notification_details_title'),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <ChevronLeft size={24} color={mauritaniaGold} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: mauritaniaGreen },
          headerTintColor: mauritaniaGold,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerIndicator}>
           <View style={[styles.iconContainer, { backgroundColor: mauritaniaGreen + '10' }]}>
             <Bell size={40} color={mauritaniaGreen} />
           </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={[styles.title, { color: colors.text }]}>
            {getNotificationTitle(notification)}
          </Text>
          
          <Text style={[styles.date, { color: colors.subtitle }]}>
            {new Date(notification._creationTime).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border + '30' }]} />

          <Text style={[styles.message, { color: colors.text }]}>
            {getNotificationMessage(notification)}
          </Text>

          {notification.metadata && (
            <View style={[styles.metaContainer, { backgroundColor: colors.border + '15' }]}>
              {notification.metadata.from && notification.metadata.to && (
                <View style={styles.metaRow}>
                  <MapPin size={18} color={mauritaniaGreen} />
                  <Text style={[styles.metaText, { color: colors.text }]}>
                    {notification.metadata.from} → {notification.metadata.to}
                  </Text>
                </View>
              )}
              {notification.metadata.name && (
                <View style={styles.metaRow}>
                  <User size={18} color={mauritaniaGreen} />
                  <Text style={[styles.metaText, { color: colors.text }]}>
                    {notification.metadata.name}
                  </Text>
                </View>
              )}
            </View>
          )}

          {notification.relatedId && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: mauritaniaGreen }]}
              onPress={() => {
                 // In this simpler implementation, we might not know if it's a trip or reservation id exactly
                 // but typically relatedId is reservationId. We target the trip detail or reservation list.
                 router.push('/(tabs)/reservations');
              }}
            >
              <Text style={styles.actionButtonText}>
                {t('view_reservation')}
              </Text>
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  headerIndicator: {
    alignItems: 'center',
    marginVertical: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 25,
    textAlign: 'center',
  },
  metaContainer: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});
