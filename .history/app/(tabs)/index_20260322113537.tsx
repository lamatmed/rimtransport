import { StyleSheet, FlatList, TouchableOpacity, useColorScheme, Image, Dimensions, Animated, RefreshControl } from 'react-native';
import { Text, View, Card } from '../../components/Themed';
import { useEffect, useState, useRef } from 'react';
import { tripService } from '../../services/tripService';
import { Trip, Profile } from '../../types';
import { authService } from '../../services/authService';
import Colors from '../../constants/Colors';
import { MapPin, Calendar, Clock, Users, Search, Plus, ArrowRight, ChevronRight, Star, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const p = await authService.getProfile(user.id);
        setProfile(p as any);
      }
      const t = await tripService.listTrips();
      setTrips(t.slice(0, 5));
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
    if (hour < 12) return 'Bon matin';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonne soirée';
  };

  const renderTrip = ({ item, index }: { item: Trip; index: number }) => {
    const translateY = useRef(new Animated.Value(50)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }],
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
                  {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <View style={[styles.iconBackground, { backgroundColor: `${colors.tint}15` }]}>
                  <Clock size={14} color={colors.tint} />
                </View>
                <Text style={[styles.detailText, { color: colors.subtitle }]}>
                  {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <View style={[styles.iconBackground, { backgroundColor: `${colors.tint}15` }]}>
                  <Users size={14} color={colors.tint} />
                </View>
                <Text style={[styles.detailText, { color: colors.subtitle }]}>
                  {item.available_seats} {item.available_seats === 1 ? 'place' : 'places'}
                </Text>
              </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
              <View>
                <Text style={[styles.priceLabel, { color: colors.subtitle }]}>Prix par personne</Text>
                <Text style={[styles.priceText, { color: colors.tint }]}>{item.price} MRU</Text>
              </View>
              <View style={styles.driverInfo}>
                <View style={[styles.driverAvatar, { backgroundColor: `${colors.tint}20` }]}>
                  <Text style={[styles.driverInitial, { color: colors.tint }]}>
                    {item.profiles?.name?.charAt(0) || 'C'}
                  </Text>
                </View>
                <Text style={[styles.driverText, { color: colors.subtitle }]}>
                  {item.profiles?.name || 'Chauffeur'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greetingText, { color: colors.subtitle }]}>{getGreeting()}</Text>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              {profile?.name || 'Utilisateur'} 👋
            </Text>
            <Text style={[styles.subWelcome, { color: colors.subtitle }]}>
              Où allez-vous aujourd'hui ?
            </Text>
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
          <Text style={[styles.searchText, { color: colors.subtitle }]}>Rechercher un trajet...</Text>
          <ChevronRight size={16} color={colors.subtitle} style={styles.searchIcon} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Trajets Récents</Text>
          <TouchableOpacity onPress={() => router.push('/trips')}>
            <Text style={[styles.seeAllText, { color: colors.tint }]}>Voir tout</Text>
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
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun trajet trouvé</Text>
              <Text style={[styles.emptySubtitle, { color: colors.subtitle }]}>
                Les trajets récents apparaîtront ici
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
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 10,
  },
  greetingText: {
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
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