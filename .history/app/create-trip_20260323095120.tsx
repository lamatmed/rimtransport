import { StyleSheet, ScrollView, Alert, useColorScheme, TouchableOpacity, Platform, Modal, KeyboardAvoidingView } from 'react-native';
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
import { Calendar as CalendarIcon, Clock, ArrowLeft, Car as CarIcon, CheckCircle } from 'lucide-react-native';

// Composant de sélection de véhicule amélioré
function CarSelector({ 
  cars, 
  selectedCar, 
  onSelectCar, 
  colors 
}: { 
  cars: Car[]; 
  selectedCar: string; 
  onSelectCar: (id: string) => void; 
  colors: any;
}) {
  if (cars.length === 0) {
    return (
      <View style={styles.noCarContainer}>
        <CarIcon size={48} color={colors.tint} />
        <Text style={styles.noCarText}>Aucun véhicule enregistré</Text>
        <Text style={styles.noCarSubText}>Ajoutez un véhicule pour pouvoir créer un trajet</Text>
      </View>
    );
  }

  return (
    <View style={styles.carPicker}>
      {cars.map(car => {
        const isSelected = selectedCar === car.id;
        return (
          <TouchableOpacity 
            key={car.id} 
            style={[
              styles.carOption,
              isSelected && styles.carOptionSelected,
              { 
                borderColor: isSelected ? colors.tint : colors.border || '#e0e0e0',
                backgroundColor: isSelected ? colors.tint + '15' : 'transparent',
              }
            ]}
            onPress={() => onSelectCar(car.id)}
          >
            <View style={styles.carOptionContent}>
              <View style={[
                styles.carIconContainer,
                isSelected && { backgroundColor: colors.tint }
              ]}>
                <CarIcon 
                  size={20} 
                  color={isSelected ? '#FFFFFF' : colors.text} 
                />
              </View>
              <View style={styles.carOptionInfo}>
                <Text style={[
                  styles.carOptionText,
                  isSelected && styles.carOptionTextSelected,
                  { color: isSelected ? colors.tint : colors.text }
                ]}>
                  {car.brand}
                </Text>
                <Text style={[
                  styles.carOptionPlate,
                  isSelected && styles.carOptionPlateSelected,
                  { color: isSelected ? colors.tint + 'CC' : colors.text + '80' }
                ]}>
                  {car.plate_number}
                </Text>
              </View>
              <View style={styles.carOptionRight}>
                <Text style={[
                  styles.carOptionSeats,
                  isSelected && styles.carOptionSeatsSelected,
                  { color: isSelected ? colors.tint : colors.text + '80' }
                ]}>
                  {car.seats} places
                </Text>
                {isSelected && (
                  <CheckCircle size={20} color={colors.tint} style={styles.checkIcon} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Composant du formulaire en plein écran
function CreateTripForm({ 
  visible, 
  onClose,
  onSuccess,
  colors 
}: { 
  visible: boolean; 
  onClose: () => void;
  onSuccess: () => void;
  colors: any;
}) {
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

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const p = await authService.getProfile(user.id);
      if (!p) {
        Alert.alert('Erreur', 'Profil non trouvé');
        onClose();
        return;
      }
      setProfile(p as any);
      if (p.role !== 'driver') {
        Alert.alert('Erreur', 'Seuls les chauffeurs peuvent créer des trajets');
        onClose();
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
      onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Échec de la création du trajet');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDepartureCity('');
    setArrivalCity('');
    setPrice('');
    setSeats('');
    setDate(new Date());
    if (cars.length > 0) setSelectedCar(cars[0].id);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalHeader, { borderBottomColor: colors.border || '#e0e0e0', backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Créer un trajet</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={[styles.modalContent, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.modalContentContainer}
        >
          <Card style={[styles.fullScreenCard, { backgroundColor: colors.cardBackground || '#FFFFFF' }]}>
            <Text style={[styles.formSubtitle, { color: colors.text + '80' }]}>
              Remplissez les détails de votre nouveau trajet
            </Text>

            <Input 
              label="Ville de Départ *" 
              placeholder="Ex: Nouakchott" 
              value={departureCity} 
              onChangeText={setDepartureCity} 
            />
            
            <Input 
              label="Ville d'Arrivée *" 
              placeholder="Ex: Nouadhibou" 
              value={arrivalCity} 
              onChangeText={setArrivalCity} 
            />
            
            <Text style={[styles.label, { color: colors.text + '80' }]}>Date et Heure de Départ *</Text>
            <TouchableOpacity 
              style={[styles.datePickerButton, { borderColor: colors.border, backgroundColor: colors.inputBackground || 'rgba(0,0,0,0.02)' }]} 
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.datePickerContent}>
                <CalendarIcon size={20} color={colors.tint} />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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

            <Input 
              label="Prix (MRU) *" 
              placeholder="Ex: 500" 
              value={price} 
              onChangeText={setPrice} 
              keyboardType="numeric" 
            />
            
            <Input 
              label="Places Disponibles *" 
              placeholder="Ex: 4" 
              value={seats} 
              onChangeText={setSeats} 
              keyboardType="numeric" 
            />
            
            <Text style={[styles.label, { color: colors.text + '80' }]}>Choisir le Véhicule *</Text>
            <CarSelector 
              cars={cars}
              selectedCar={selectedCar}
              onSelectCar={setSelectedCar}
              colors={colors}
            />
            
            {cars.length === 0 && (
              <TouchableOpacity 
                style={[styles.addCarButton, { borderColor: colors.tint }]}
                onPress={() => {
                  onClose();
                  router.push('/my-cars');
                }}
              >
                <Text style={[styles.addCarButtonText, { color: colors.tint }]}>
                  + Ajouter un véhicule
                </Text>
              </TouchableOpacity>
            )}

            <Button 
              title="Publier le Trajet" 
              onPress={handleCreate} 
              loading={loading} 
              disabled={cars.length === 0}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Écran principal
export default function CreateTripScreen() {
  const [showForm, setShowForm] = useState(true);
  const router = useRouter();

  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];

  const handleClose = () => {
    router.back();
  };

  const handleSuccess = () => {
    // Le trajet a été créé avec succès
  };

  return (
    <CreateTripForm 
      visible={showForm}
      onClose={handleClose}
      onSuccess={handleSuccess}
      colors={colors}
    />
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  fullScreenCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  datePickerButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
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
    marginBottom: 16,
    gap: 12,
  },
  carOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 0,
  },
  carOptionSelected: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  carOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  carOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  carOptionTextSelected: {
    fontWeight: '700',
  },
  carOptionPlate: {
    fontSize: 12,
    marginTop: 2,
  },
  carOptionPlateSelected: {
    fontWeight: '500',
  },
  carOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  carOptionSeats: {
    fontSize: 14,
  },
  carOptionSeatsSelected: {
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 4,
  },
  noCarContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noCarText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noCarSubText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  addCarButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 24,
  },
  addCarButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});