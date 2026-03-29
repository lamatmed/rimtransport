import { StyleSheet, FlatList, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { Text, View, Card } from '../../components/Themed';
import { useEffect, useState } from 'react';
import { tripService } from '../../services/tripService';
import { Trip, Profile } from '../../types';
import { authService } from '../../services/authService';
import Colors from '../../constants/Colors';
import { MapPin, Calendar, Clock, Users, Search, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];

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
      setTrips(t.slice(0, 5)); // Show recent 5
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderTrip = ({ item }: { item: Trip }) => (
    <TouchableOpacity onPress={() => router.push(`/trip/${item.id}` as any)}>
      <Card style={styles.tripCard}>
        <View style={styles.tripHeader}>
          <Text style={styles.cityText}>{item.departure_city}</Text>
          <View style={styles.arrowContainer}>
             <View style={styles.dot} />
             <View style={styles.line} />
             <View style={styles.dot} />
          </View>
          <Text style={styles.cityText}>{item.arrival_city}</Text>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
             <Calendar size={16} color={colors.subtitle} />
             <Text style={styles.detailText}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailItem}>
             <Clock size={16} color={colors.subtitle} />
             <Text style={styles.detailText}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={styles.detailItem}>
             <Users size={16} color={colors.subtitle} />
             <Text style={styles.detailText}>{item.available_seats} places</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
           <Text style={[styles.priceText, { color: colors.tint }]}>{item.price} MRU</Text>
           <Text style={styles.driverText}>Par {item.profiles?.name}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bonjour, {profile?.name || 'Utilisateur'}</Text>
          <Text style={styles.subWelcome}>Où allez-vous aujourd'hui ?</Text>
        </View>
        {profile?.role === 'driver' && (
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/create-trip')}
          >
            <Plus color="#FFF" size={24} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.searchBar, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={() => router.push('/trips')}
      >
        <Search size={20} color={colors.subtitle} />
        <Text style={[styles.searchText, { color: colors.subtitle }]}>Rechercher un trajet...</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Trajets Récents</Text>
      
      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={item => item.id}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subWelcome: {
    fontSize: 16,
    opacity: 0.6,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  searchText: {
    marginLeft: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  tripCard: {
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cityText: {
    fontSize: 18,
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
    backgroundColor: '#00A95C',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 5,
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
    fontSize: 13,
    color: '#8E8E93',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00A95C',
  },
  driverText: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  }
});
