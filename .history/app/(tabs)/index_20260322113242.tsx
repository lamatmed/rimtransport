import { StyleSheet, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { Text, View, Card } from '../../components/Themed';
import { useEffect, useState } from 'react';
import { tripService } from '../../services/tripService';
import { Trip, Profile } from '../../types';
import { authService } from '../../services/authService';
import { MapPin, Calendar, Clock, Users, Search, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const theme = useColorScheme() || 'light';

  useEffect(() => {
    loadData();
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
    }
  };

  const renderTrip = ({ item }: { item: Trip }) => (
    <TouchableOpacity 
      activeOpacity={0.85}
      onPress={() => router.push(`/trip/${item.id}` as any)}
    >
      <Card style={styles.tripCard}>
        
        {/* Trajet */}
        <View style={styles.tripHeader}>
          <Text style={styles.cityText}>{item.departure_city}</Text>

          <View style={styles.arrowContainer}>
            <View style={styles.dot} />
            <View style={styles.line} />
            <View style={styles.dot} />
          </View>

          <Text style={styles.cityText}>{item.arrival_city}</Text>
        </View>

        {/* Détails */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Calendar size={16} color="#888" />
            <Text style={styles.detailText}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Clock size={16} color="#888" />
            <Text style={styles.detailText}>
              {new Date(item.date).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Users size={16} color="#888" />
            <Text style={styles.detailText}>
              {item.available_seats} places
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>{item.price} MRU</Text>
          <Text style={styles.driverText}>
            Par {item.profiles?.name}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>
            Bonjour, {profile?.name || 'Utilisateur'}
          </Text>
          <Text style={styles.subWelcome}>
            Où allez-vous aujourd'hui ?
          </Text>
        </View>

        {profile?.role === 'driver' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/create-trip')}
          >
            <Plus color="#FFF" size={22} />
          </TouchableOpacity>
        )}
      </View>

      {/* SEARCH */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => router.push('/trips')}
        activeOpacity={0.8}
      >
        <Search size={20} color="#888" />
        <Text style={styles.searchText}>
          Rechercher un trajet...
        </Text>
      </TouchableOpacity>

      {/* TITLE */}
      <Text style={styles.sectionTitle}>Trajets récents</Text>

      {/* LIST */}
      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadData}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>Aucun trajet trouvé</Text>
          </View>
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

  /* HEADER */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#006233',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },

  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },

  subWelcome: {
    fontSize: 14,
    color: '#D4AF37',
    marginTop: 4,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* SEARCH */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFF',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  searchText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#888',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#006233',
  },

  list: {
    paddingBottom: 20,
  },

  /* CARD */
  tripCard: {
    marginBottom: 16,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FFF',
    borderLeftWidth: 4,
    borderLeftColor: '#006233',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  cityText: {
    fontSize: 16,
    fontWeight: '600',
  },

  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#006233',
  },

  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#D4AF37',
    marginHorizontal: 6,
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#888',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },

  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006233',
  },

  driverText: {
    fontSize: 12,
    color: '#666',
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
});