import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ScrollView,
  Switch,
} from 'react-native';
import { Text, View, Card } from '../components/Themed';
import Input from '../components/Input';
import Button from '../components/Button';
import { useState, useEffect } from 'react';
import { carService } from '../services/carService';
import { authService } from '../services/authService';
import { Car } from '../types';
import Colors from '../constants/Colors';
import {
  Car as CarIcon,
  Trash2,
  PlusCircle,
  Wind,
  Briefcase,
  Wifi,
  Music,
  PawPrint,
  X,
} from 'lucide-react-native';

// ---------- Option toggle row ----------
function OptionToggle({
  icon,
  label,
  value,
  onToggle,
  accentColor,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  accentColor: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.optionRow, !isLast && styles.optionRowBorder]}>
      <View style={styles.optionLeft}>
        {icon}
        <Text style={styles.optionLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#ccc', true: accentColor + '88' }}
        thumbColor={value ? accentColor : '#f4f3f4'}
      />
    </View>
  );
}

// ---------- Option chips on car cards ----------
function OptionChips({ car, accentColor }: { car: Car; accentColor: string }) {
  const chips: { key: string; icon: React.ReactNode; label: string }[] = [];
  if (car.has_ac) chips.push({ key: 'ac', icon: <Wind size={11} color={accentColor} />, label: 'Clim' });
  if (car.has_luggage) chips.push({ key: 'luggage', icon: <Briefcase size={11} color={accentColor} />, label: 'Bagage' });
  if (car.has_wifi) chips.push({ key: 'wifi', icon: <Wifi size={11} color={accentColor} />, label: 'Wi-Fi' });
  if (car.has_music) chips.push({ key: 'music', icon: <Music size={11} color={accentColor} />, label: 'Musique' });
  if (car.is_pet_friendly) chips.push({ key: 'pet', icon: <PawPrint size={11} color={accentColor} />, label: 'Animaux' });

  if (chips.length === 0) return null;
  return (
    <View style={styles.chipsRow}>
      {chips.map((c) => (
        <View key={c.key} style={[styles.chip, { borderColor: accentColor + '55', backgroundColor: accentColor + '11' }]}>
          {c.icon}
          <Text style={[styles.chipText, { color: accentColor }]}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------- Main screen ----------
export default function MyCarsScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [brand, setBrand] = useState('');
  const [plate, setPlate] = useState('');
  const [seats, setSeats] = useState('');
  const [hasAC, setHasAC] = useState(false);
  const [hasLuggage, setHasLuggage] = useState(false);
  const [hasWifi, setHasWifi] = useState(false);
  const [hasMusic, setHasMusic] = useState(false);
  const [isPetFriendly, setIsPetFriendly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];

  useEffect(() => { loadCars(); }, []);

  const loadCars = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) setCars(await carService.getDriverCars(user.id));
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setBrand(''); setPlate(''); setSeats('');
    setHasAC(false); setHasLuggage(false);
    setHasWifi(false); setHasMusic(false); setIsPetFriendly(false);
  };

  const openSheet = () => {
    resetForm();
    setShowAdd(true);
  };
  const closeSheet = () => setShowAdd(false);

  const handleAdd = async () => {
    if (!brand || !plate || !seats) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      await carService.createCar({
        driver_id: user?.id,
        brand,
        plate_number: plate,
        seats: parseInt(seats),
        has_ac: hasAC,
        has_luggage: hasLuggage,
        has_wifi: hasWifi,
        has_music: hasMusic,
        is_pet_friendly: isPetFriendly,
      });
      closeSheet();
      loadCars();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || "Échec de l'ajout du véhicule");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer le Véhicule', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          await carService.deleteCar(id);
          loadCars();
        }
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Véhicules</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.tint }]}
          onPress={openSheet}
        >
          <PlusCircle color="#fff" size={18} />
          <Text style={styles.addBtnText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* ── Add form (Inline) ── */}
      {showAdd && (
        <Card style={styles.addCard}>
          <Text style={styles.formTitle}>Nouveau Véhicule</Text>
          <Input label="Marque / Modèle *" placeholder="Ex: Toyota Corolla" value={brand} onChangeText={setBrand} />
          <Input label="Numéro de Plaque *" placeholder="Ex: 1234 AA 00" value={plate} onChangeText={setPlate} />
          <Input label="Nombre de Places *" placeholder="Ex: 5" value={seats} onChangeText={setSeats} keyboardType="numeric" />

          {/* Options */}
          <Text style={styles.sectionLabel}>Options du véhicule</Text>
          <View style={styles.optionsContainer}>
            <OptionToggle icon={<Wind size={18} color={colors.tint} />} label="Climatiseur" value={hasAC} onToggle={setHasAC} accentColor={colors.tint} />
            <OptionToggle icon={<Briefcase size={18} color={colors.tint} />} label="Compartiment bagage" value={hasLuggage} onToggle={setHasLuggage} accentColor={colors.tint} />
            <OptionToggle icon={<Wifi size={18} color={colors.tint} />} label="Wi-Fi à bord" value={hasWifi} onToggle={setHasWifi} accentColor={colors.tint} />
            <OptionToggle icon={<Music size={18} color={colors.tint} />} label="Système audio" value={hasMusic} onToggle={setHasMusic} accentColor={colors.tint} />
            <OptionToggle icon={<PawPrint size={18} color={colors.tint} />} label="Animaux acceptés" value={isPetFriendly} onToggle={setIsPetFriendly} accentColor={colors.tint} isLast />
          </View>

          <View style={styles.formButtons}>
            <Button title="Enregistrer le Véhicule" onPress={handleAdd} loading={loading} />
            <Button title="Annuler" variant="outline" onPress={closeSheet} />
          </View>
        </Card>
      )}

      {/* ── Car list ── */}
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card style={styles.carCard}>
            <View style={styles.carTop}>
              <View style={styles.carInfo}>
                <View style={[styles.iconBadge, { backgroundColor: colors.tint + '22' }]}>
                  <CarIcon color={colors.tint} size={22} />
                </View>
                <View style={styles.carTexts}>
                  <Text style={styles.carBrand}>{item.brand}</Text>
                  <Text style={styles.carPlate}>{item.plate_number}</Text>
                  <Text style={styles.carSeats}>{item.seats} places</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Trash2 color="#FF3B30" size={20} />
              </TouchableOpacity>
            </View>
            <OptionChips car={item} accentColor={colors.tint} />
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun véhicule enregistré pour le moment.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '800' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    gap: 6,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Add card
  addCard: { marginBottom: 24, padding: 18 },
  formTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },
  optionsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.15)',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionLabel: { fontSize: 15 },
  formButtons: { marginTop: 16, gap: 10 },

  // Car card
  carCard: { marginBottom: 14, padding: 14 },
  carTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  carInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBadge: {
    width: 44, height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carTexts: { marginLeft: 12, flex: 1 },
  carBrand: { fontSize: 16, fontWeight: '700' },
  carPlate: { fontSize: 13, opacity: 0.6, marginTop: 2 },
  carSeats: { fontSize: 12, opacity: 0.45, marginTop: 1 },
  deleteBtn: { padding: 6 },

  // Chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  chipText: { fontSize: 11, fontWeight: '600' },

  emptyText: { textAlign: 'center', opacity: 0.5, marginTop: 40 },
});
