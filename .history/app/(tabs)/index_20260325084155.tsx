import { StyleSheet, FlatList, TouchableOpacity, useColorScheme, Image, Dimensions, Animated, RefreshControl } from 'react-native';
import { Text, View, Card } from '../../components/Themed';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Trip, Profile } from '../../types';
import { authService } from '../../services/authService';
import Colors from '../../constants/Colors';
import { User, MapPin, Calendar, Clock, Users, Search, Plus, ArrowRight, ChevronRight, Star, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { LanguageService } from '../../services/i18n';
import { useLanguage } from '../_layout';

const { width } = Dimensions.get('window');

function getProfileImageUri(profile: any): string | undefined {
  if (!profile) return undefined;
  if (profile.photoUrl) return profile.photoUrl;
  if (!profile.photoStorageId) return undefined;

  const site = process.env.EXPO_PUBLIC_CONVEX_SITE_URL || process.env.EXPO_PUBLIC_CONVEX_URL;
  if (!site) return undefined;

  const base = String(site).replace(/\/+$/, "");
  return `${base}/api/storage/${profile.photoStorageId}`;
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, ] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { locale } = useLanguage();
  const { t } = LanguageService;
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Store animation values for each trip
  const [tripAnimations] = useState(() => 
    Array(5).fill(null).map(() => ({
      translateY: new Animated.Value(50),
      opacity: new Animated.Value(0)
    }))
  );

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const liveTripsRaw = useQuery(api.trips.listAvailableTrips, {});
  const trips = useMemo(() => {
    if (!liveTripsRaw) return [];
    return liveTripsRaw
      .map((trip: any) => ({
        ...trip,
        driver_id: trip.driverId,
        car_id: trip.carId,
        departure_city: trip.departureCity,
        arrival_city: trip.arrivalCity,
        available_seats: trip.availableSeats,
      }))
      .slice(0, 5) as Trip[];
  }, [liveTripsRaw]);

  // Animate trips when they load
  useEffect(() => {
    if (trips.length > 0) {
      trips.forEach((_, index) => {
        if (tripAnimations[index]) {
          Animated.parallel([
            Animated.timing(tripAnimations[index].translateY, {
              toValue: 0,
              duration: 500,
              delay: index * 100,
              useNativeDriver: true,
            }),
            Animated.timing(tripAnimations[index].opacity, {
              toValue: 1,
              duration: 500,
              delay: index * 100,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });
    }
  }, [trips]);

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const p = await authService.getProfile(user.id);
        setProfile(p as any);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('good_morning');
    if (hour < 18) return t('good_afternoon');
    return t('good_evening');
  };

  const TripCard = ({ item, index }: { item: Trip; index: number }) => {
    const animation = tripAnimations[index] || {
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(1)
    };
    
    return (
      <Animated.View
        style={{
          opacity: animation.opacity,
          transform: [{ translateY: animation.translateY }],
        }}
      >
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => router.push(`/trip/${item.id}` as any)}
        >
          <View style={[styles.tripCard, { 
            backgroundColor: colors.card,
            shadowColor: theme === 'dark' ? '#000' : '#8E8E93',
            borderWidth: theme === 'dark' ? 1 : 0,
            borderColor: colors.border,
          }]}>
            <View style={styles.tripHeader}>
              <View style={styles.cityContainer}>
                <View style={styles.cityWrapper}>
                  <MapPin size={16} color={colors.tint} style={styles.cityIcon} />
                  <Text style={[styles.cityText, { color: colors.text }]}>{item.departure_city}</Text>
                </View>
                <View style={styles.arrowWrapper}>
                  <View style={[styles.line, { backgroundColor: colors.border }]} />
                  <ArrowRight size={18} color={colors.tint} />
                  <View style={[styles.line, { backgroundColor: colors.border }]} />
                </View>
                <View style={styles.cityWrapper}>
                  <Navigation size={16} color={colors.tint} style={styles.cityIcon} />
                  <Text style={[styles.cityText, { color: colors.text }]}>{item.arrival_city}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <View style={[styles.iconBackground, { backgroundColor: `${colors.tint}15` }]}>
                  <Calendar size={14} color={colors.tint} />
                </View>
                <Text style={[styles.detailText, { color: colors.subtitle }]}>
                  {new Date(item.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'fr-FR', { 
                    day: 'numeric', 
                    month: 'short',
                    numberingSystem: 'latn'
                  })}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <View style={[styles.iconBackground, { backgroundColor: `${colors.tint}15` }]}>
                  <Clock size={14} color={colors.tint} />
                </View>
                <Text style={[styles.detailText, { color: colors.subtitle }]}>
                  {new Date(item.date).toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    numberingSystem: 'latn'
                  })}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <View style={[styles.iconBackground, { backgroundColor: `${colors.tint}15` }]}>
                  <Users size={14} color={colors.tint} />
                </View>
                <Text style={[styles.detailText, { color: colors.subtitle }]}>
                  {item.available_seats} {item.available_seats === 1 ? t('place') : t('places')}
                </Text>
              </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
              <View>
                <Text style={[styles.priceLabel, { color: colors.subtitle }]}>{t('price_per_person')}</Text>
                <Text style={[styles.priceText, { color: colors.tint }]}>
                  {item.price} MRU
                </Text>
              </View>
              <View style={styles.driverInfo}>
                <View style={[styles.driverAvatar, { backgroundColor: `${colors.tint}20` }]}>
                  <Text style={[styles.driverInitial, { color: colors.tint }]}>
                    {item.profiles?.name?.charAt(0) || 'C'}
                  </Text>
                </View>
                <Text style={[styles.driverText, { color: colors.subtitle }]}>
                  {item.profiles?.name || t('role_driver')}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTrip = ({ item, index }: { item: Trip; index: number }) => (
    <TripCard item={item} index={index} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={styles.header}>
          <View style={styles.headerProfileRow}>
            <View style={[styles.profileIconContainer, { backgroundColor: colors.tint }]}>
              {getProfileImageUri(profile) ? (
                <Image source={{ uri: getProfileImageUri(profile)! }} style={styles.profilePhoto} />
              ) : (
                <User size={28} color="#FFF" />
              )}
            </View>
            <View>
              <Text style={[styles.greetingText, { color: colors.subtitle }]}>{getGreeting()}</Text>
              <Text style={[styles.welcomeText, { color: colors.text }]}>
                {profile?.name || '...'} 👋
              </Text>
              <Text style={[styles.subWelcome, { color: colors.subtitle }]}>
                {t('where_to')}
              </Text>
            </View>
          </View>
          {profile?.role === 'driver' && (
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/create-trip')}
              activeOpacity={0.8}
            >
              <Plus color="#FFF" size={24} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.searchBar, { 
            borderColor: colors.border, 
            backgroundColor: colors.card,
            shadowColor: theme === 'dark' ? '#000' : '#8E8E93',
          }]}
          onPress={() => router.push('/trips')}
          activeOpacity={0.7}
        >
          <Search size={20} color={colors.subtitle} />
          <Text style={[styles.searchText, { color: colors.subtitle }]}>{t('search_trip')}</Text>
          <ChevronRight size={16} color={colors.subtitle} style={styles.searchIcon} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('recent_trips')}</Text>
          <TouchableOpacity onPress={() => router.push('/trips')}>
            <Text style={[styles.seeAllText, { color: colors.tint }]}>{t('see_all')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.tint}10` }]}>
                <Search size={40} color={colors.tint} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('no_trips_found')}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.subtitle }]}>
                {t('recent_trips_appear_here')}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  greetingText: {
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subWelcome: {
    fontSize: 15,
    opacity: 0.7,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  searchIcon: {
    marginLeft: 'auto',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  tripCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  tripHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  cityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityIcon: {
    marginRight: 6,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  arrowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    flex: 0.5,
  },
  line: {
    flex: 1,
    height: 1,
    marginHorizontal: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBackground: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    padding: 16,
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  driverInitial: {
    fontSize: 14,
    fontWeight: '600',
  },
  driverText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});