import { StyleSheet, ScrollView, Alert, useColorScheme, TouchableOpacity, Platform } from 'react-native';
import { Text, View, Card } from '../components/Themed';
import Input from '../components/Input';
import Button from '../components/Button';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { tripService } from '../services/tripService';
import { carService } from '../services/carService';
import { authService } from '../services/authService';
import { Car, Profile } from '../types';
import Colors from '../constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar as CalendarIcon, Clock } from 'lucide-react-native';

export default function CreateTripScreen() {
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const router = useRouter();
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const p = await authService.getProfile(user.id);
      if (!p) {
        Alert.alert('Erreur', 'Profil non trouvé');
        router.back();
        return;
      }
      setProfile(p as any);
      if (p.role !== 'driver') {
        Alert.alert('Erreur', 'Seuls les chauffeurs peuvent créer des trajets');
        router.back();
        return;
      }
      const c = await carService.getDriverCars(user.id);
      setCars(c);
      if (c.length > 0) setSelectedCar(c[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const currentDate = new Date(date);
      currentDate.setFullYear(selectedDate.getFullYear());
      currentDate.setMonth(selectedDate.getMonth());
      currentDate.setDate(selectedDate.getDate());
      setDate(currentDate);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const currentDate = new Date(date);
      currentDate.setHours(selectedTime.getHours());
      currentDate.setMinutes(selectedTime.getMinutes());
      setDate(currentDate);
    }
  };

  const handleCreate = async () => {
    if (!departureCity || !arrivalCity || !price || !seats || !selectedCar) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      await tripService.createTrip({
        driver_id: user?.id,
        car_id: selectedCar,
        departure_city: departureCity,
        arrival_city: arrivalCity,
        date: date.getTime(),
        price: parseFloat(price),
        available_seats: parseInt(seats),
      });
      Alert.alert('Succès', 'Trajet créé avec succès !');
      router.back();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Échec de la création du trajet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.subtitle}>Remplissez les détails de votre nouveau trajet</Text>

      <Card style={styles.formCard}>
        <Input label="Ville de Départ" placeholder="Ex: Nouakchott" value={departureCity} onChangeText={setDepartureCity} />
        <Input label="Ville d'Arrivée" placeholder="Ex: Nouadhibou" value={arrivalCity} onChangeText={setArrivalCity} />
        
        <Text style={styles.label}>Date et Heure de Départ</Text>
        <TouchableOpacity 
          style={[styles.datePickerButton, { borderColor: colors.border }]} 
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.datePickerContent}>
             <CalendarIcon size={20} color={colors.tint} />
             <Text style={styles.dateText}>
               {date.toLocaleDateString()} à {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </Text>
          </View>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <Input label="Prix (MRU)" placeholder="Ex: 500" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <Input label="Places Disponibles" placeholder="Ex: 4" value={seats} onChangeText={setSeats} keyboardType="numeric" />
        
        <Text style={styles.label}>Choisir le Véhicule</Text>
        <View style={styles.carPicker}>
          {cars.map(car => (
            <TouchableOpacity 
              key={car.id} 
              style={[
                styles.carOption, 
                { borderColor: colors.border },
                selectedCar === car.id && { backgroundColor: colors.tint, borderColor: colors.tint }
              ]}
              onPress={() => setSelectedCar(car.id)}
            >
              <Text style={[styles.carOptionText, selectedCar === car.id && { color: '#FFF' }]}>
                {car.brand} - {car.plate_number}
              </Text>
            </TouchableOpacity>
          ))}
          {cars.length === 0 && (
            <TouchableOpacity onPress={() => router.push('/my-cars')}>
              <Text style={{ color: colors.tint }}>+ Ajouter une voiture d'abord</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button title="Publier le Trajet" onPress={handleCreate} loading={loading} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 20,
  },
  formCard: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
    opacity: 0.6,
  },
  datePickerButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  carPicker: {
    marginBottom: 24,
  },
  carOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  carOptionText: {
    fontSize: 16,
  },
});
