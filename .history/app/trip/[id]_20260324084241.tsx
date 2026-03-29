import { StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert, Linking, Image } from 'react-native';
import { Text, View, Card } from '../../components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Trip, Reservation } from '../../types';
import { tripService } from '../../services/tripService';
import { reservationService } from '../../services/reservationService';
import { authService } from '../../services/authService';
import Colors from '../../constants/Colors';
import Button from '../../components/Button';
import { MapPin, Calendar, Clock, Car, User, Users, Phone, CheckCircle, Wind, Briefcase, Wifi, Music, PawPrint, X } from 'lucide-react-native';
import { Modal } from 'react-native';

function formatMemberSinceDate(value?: string | number | null) {
  if (value !== 0 && !value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('fr-FR');
}

function memberSinceLine(profile: any): string | null {
  const raw = profile?.created_at ?? profile?.createdAt ?? profile?._creationTime;
  const formatted = formatMemberSinceDate(raw);
  return formatted ? `Membre depuis le ${formatted}` : null;
}

// ---------- Option chips on car cards ----------
function OptionChips({ car, accentColor }: { car: any; accentColor: string }) {
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

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [requestedSeats, setRequestedSeats] = useState(1);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tripPassengerBookings, setTripPassengerBookings] = useState<Reservation[]>([]);
  const [loadingTripPassengers, setLoadingTripPassengers] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCarDetails, setShowCarDetails] = useState(false);
  const router = useRouter();
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      const data = await tripService.getTripDetails(id as string);
      setTrip(data);
      
      // Load reservations if the viewer is the driver
      if (user && data && String(user.id) === String(data.driver_id)) {
        loadReservations();
      }

      // Passagers connectés (non chauffeur) : liste des réservations sur ce trajet
      if (user && data && String(user.id) !== String(data.driver_id)) {
        setLoadingTripPassengers(true);
        try {
          const bookings = await reservationService.getTripReservations(id as string);
          setTripPassengerBookings(bookings);
        } catch (e) {
          console.error(e);
          setTripPassengerBookings([]);
        } finally {
          setLoadingTripPassengers(false);
        }
      } else {
        setTripPassengerBookings([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    setLoadingReservations(true);
    try {
      const res = await reservationService.getTripReservations(id as string);
      setReservations(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleCall = async (phone?: string | null) => {
    if (!phone) {
      Alert.alert('Numéro indisponible', 'Aucun numéro de téléphone trouvé.');
      return;
    }
    const sanitized = String(phone).replace(/[^\d+]/g, '');
    const url = `tel:${sanitized}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Appel impossible', 'Votre appareil ne peut pas lancer un appel.');
      return;
    }
    await Linking.openURL(url);
  };

  const handleUpdateStatus = async (resId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await reservationService.updateReservationStatus(resId, status);
      loadReservations();
      const updatedTrip = await tripService.getTripDetails(id as string);
      setTrip(updatedTrip);
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de mettre à jour la réservation');
    }
  };

  const promptRefuseReservation = (resId: string) => {
    Alert.alert(
      'Refuser la réservation',
      'Le passager verra la réservation comme annulée et les places seront remises en vente.',
      [
        { text: 'Retour', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: () => handleUpdateStatus(resId, 'cancelled'),
        },
      ]
    );
  };

  const promptCancelConfirmedReservation = (resId: string) => {
    Alert.alert(
      'Annuler la réservation',
      'Les places seront de nouveau disponibles sur ce trajet.',
      [
        { text: 'Retour', style: 'cancel' },
        {
          text: 'Annuler la réservation',
          style: 'destructive',
          onPress: () => handleUpdateStatus(resId, 'cancelled'),
        },
      ]
    );
  };

  const handleReserve = async () => {
    if (!currentUser) {
      Alert.alert('Authentification requise', 'Veuillez vous connecter pour réserver une place.');
      router.push('/login');
      return;
    }
    
    Alert.alert(
      'Confirmer la Réservation',
      `Voulez-vous réserver ${requestedSeats} place(s) pour ${trip?.price! * requestedSeats} MRU ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: async () => {
            setReserving(true);
            try {
              await reservationService.reserveSeats({
                trip_id: trip?.id,
                user_id: currentUser.id,
                seats: requestedSeats,
              });
              Alert.alert('Succès', 'Votre réservation est en attente de confirmation !');
              router.push('/(tabs)/reservations');
            } catch (e: any) {
              Alert.alert('Erreur', e.message || 'Échec de la réservation');
            } finally {
              setReserving(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteTrip = async () => {
    if (!trip?.id || !currentUser?.id) return;
    Alert.alert(
      'Supprimer le trajet',
      'Voulez-vous vraiment supprimer ce trajet ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await tripService.deleteTrip(trip.id, currentUser.id);
              Alert.alert('Trajet supprimé', 'Le trajet a bien été supprimé.');
              router.replace('/(tabs)');
            } catch (e: any) {
              Alert.alert('Erreur', e.message || 'Impossible de supprimer le trajet');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Text>Trajet non trouvé</Text>
      </View>
    );
  }

  const isDriver = String(currentUser?.id) === String(trip.driver_id);

  const activeTripBookings = tripPassengerBookings.filter((r) => r.status !== 'cancelled');
  const driverMemberSinceLine = trip.profiles ? memberSinceLine(trip.profiles) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Card style={styles.mainCard}>
        <View style={styles.routeContainer}>
          <View style={styles.locationRow}>
             <MapPin size={24} color={colors.tint} />
             <View style={styles.locationTexts}>
                <Text style={styles.label}>Départ</Text>
                <Text style={styles.cityText}>{trip.departure_city}</Text>
             </View>
          </View>
          
          <View style={styles.verticalLine} />

          <View style={styles.locationRow}>
             <CheckCircle size={24} color="#34C759" />
             <View style={styles.locationTexts}>
                <Text style={styles.label}>Arrivée</Text>
                <Text style={styles.cityText}>{trip.arrival_city}</Text>
             </View>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Calendar size={20} color={colors.tint} />
            <Text style={styles.infoValue}>{new Date(trip.date).toLocaleDateString()}</Text>
            <Text style={styles.infoLabel}>Date</Text>
          </View>
          <View style={styles.infoBox}>
            <Clock size={20} color={colors.tint} />
            <Text style={styles.infoValue}>{new Date(trip.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <Text style={styles.infoLabel}>Heure</Text>
          </View>
          <View style={styles.infoBox}>
            <Users size={20} color={colors.tint} />
            <Text style={styles.infoValue}>{trip.available_seats}</Text>
            <Text style={styles.infoLabel}>Places restantes</Text>
          </View>
        </View>
      </Card>

      {!isDriver && (
        <Card style={styles.reservationSettings}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Users size={22} color={colors.tint} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 0, fontSize: 18 }]}>Réserver des places</Text>
          </View>
          
          <View style={styles.seatSelector}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.seatLabel}>Nombre de voyageurs</Text>
              <View style={{ backgroundColor: colors.tint + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: colors.tint, fontWeight: '700', fontSize: 12 }}>
                  {trip.available_seats} dispo
                </Text>
              </View>
            </View>

            <View style={styles.counterRow}>
              <TouchableOpacity 
                style={[styles.counterBtn, requestedSeats <= 1 && { opacity: 0.4, backgroundColor: '#f0f0f0' }]} 
                onPress={() => setRequestedSeats(s => Math.max(1, s - 1))}
                disabled={requestedSeats <= 1}
              >
                <Text style={[styles.counterBtnText, requestedSeats <= 1 && { color: '#999' }]}>-</Text>
              </TouchableOpacity>
              
              <View style={styles.counterValueContainer}>
                <Text style={styles.counterValue}>{requestedSeats}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.counterBtn, requestedSeats >= (trip.available_seats || 0) && { opacity: 0.4, backgroundColor: '#f0f0f0' }]} 
                onPress={() => setRequestedSeats(s => Math.min(trip.available_seats, s + 1))}
                disabled={requestedSeats >= (trip.available_seats || 0)}
              >
                <Text style={[styles.counterBtnText, requestedSeats >= (trip.available_seats || 0) && { color: '#999' }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      )}

      {!isDriver && trip.profiles && (
        <>
          <Text style={styles.sectionTitle}>Infos Chauffeur</Text>
          <Card style={styles.driverCard}>
            <View style={styles.driverRow}>
              <View style={[styles.driverIconContainer, { backgroundColor: colors.tint }]}>
                {trip.profiles.photoUrl ? (
                  <Image source={{ uri: trip.profiles.photoUrl }} style={styles.driverPhoto} />
                ) : (
                  <User size={32} color="#FFF" />
                )}
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{trip.profiles.name}</Text>
                <TouchableOpacity style={styles.phoneRow} onPress={() => handleCall(trip.profiles?.phone)}>
                  <Phone size={14} color={colors.s} />
                  <Text style={styles.passengerPhone}>{trip.profiles.phone}</Text>
                </TouchableOpacity>
                {driverMemberSinceLine && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: colors.tint, fontWeight: '600' }}>
                      {driverMemberSinceLine}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        </>
      )}

      {/* Passager connecté : autres personnes ayant réservé sur ce trajet */}
      {!isDriver && currentUser && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Passagers sur ce trajet</Text>
            {loadingTripPassengers && <ActivityIndicator size="small" color={colors.tint} />}
          </View>
          {loadingTripPassengers && activeTripBookings.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Chargement des passagers…</Text>
            </Card>
          ) : activeTripBookings.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Aucune réservation active sur ce trajet pour le moment.
              </Text>
            </Card>
          ) : (
            activeTripBookings.map((res) => {
              const passengerMemberLine = memberSinceLine(res.profiles);
              return (
              <Card key={res.id} style={[styles.reservationCard, { marginBottom: 12 }]}>
                <View style={styles.passengerInfo}>
                  <View style={styles.passengerAvatar}>
                    {res.profiles?.photoUrl ? (
                      <Image source={{ uri: res.profiles.photoUrl }} style={styles.passengerPhoto} />
                    ) : (
                      <User size={20} color={colors.tint} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.passengerName}>{res.profiles?.name ?? '—'}</Text>
                    <TouchableOpacity style={styles.phoneRow} onPress={() => handleCall(res.profiles?.phone)}>
                      <Phone size={12} color={colors.tint} />
                      <Text style={styles.passengerPhone}>{res.profiles?.phone ?? '—'}</Text>
                    </TouchableOpacity>
                    {passengerMemberLine && (
                      <Text style={{ fontSize: 11, color: colors.subtitle, marginTop: 2 }}>
                        {passengerMemberLine}
                      </Text>
                    )}
                    <Text style={[styles.seatsText, { marginTop: 6 }]}>
                      {res.seats} place(s) ·{' '}
                      {res.status === 'pending'
                        ? 'En attente'
                        : res.status === 'confirmed'
                          ? 'Acceptée'
                          : res.status === 'delayed'
                            ? 'Retardée'
                            : res.status}
                    </Text>
                  </View>
                </View>
              </Card>
            );
            })
          )}
        </>
      )}

      {trip.cars && (
        <>
          <Text style={styles.sectionTitle}>Infos Véhicule</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowCarDetails(true)}>
            <Card style={styles.carCard}>
              <Car size={24} color={colors.tint} />
              <View style={styles.carInfo}>
                <Text style={styles.carBrand}>{trip.cars.brand}</Text>
                <Text style={styles.carPlate}>{trip.cars.plate_number}</Text>
                <OptionChips car={trip.cars} accentColor={colors.tint} />
                <Text style={{color: colors.tint, marginTop: 8, fontWeight: '600', fontSize: 12}}>
                  Voir tous les détails &gt;
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        </>
      )}

      {isDriver && (
        <View style={styles.driverView}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Réservations Passagers</Text>
            {loadingReservations && <ActivityIndicator size="small" color={colors.tint} />}
          </View>
          
          {reservations.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucune réservation pour ce trajet.</Text>
            </Card>
          ) : (
            reservations.map((res) => {
              const paxMemberLine = memberSinceLine(res.profiles);
              return (
              <Card key={res.id} style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                  <View style={styles.passengerInfo}>
                    <View style={styles.passengerAvatar}>
                      {res.profiles?.photoUrl ? (
                        <Image source={{ uri: res.profiles.photoUrl }} style={styles.passengerPhoto} />
                      ) : (
                        <User size={20} color={colors.tint} />
                      )}
                    </View>
                    <View>
                      <Text style={styles.passengerName}>{res.profiles?.name}</Text>
                      <TouchableOpacity style={styles.phoneRow} onPress={() => handleCall(res.profiles?.phone)}>
                        <Phone size={12} color={colors.tint} />
                        <Text style={styles.passengerPhone}>{res.profiles?.phone}</Text>
                      </TouchableOpacity>
                      {paxMemberLine && (
                        <Text style={{ fontSize: 11, color: colors.subtitle, marginTop: 2 }}>
                          {paxMemberLine}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: res.status === 'confirmed' ? '#34C75920' : 
                                  res.status === 'cancelled' ? '#FF3B3020' : '#FF950020' 
                  }]}>
                    <Text style={[styles.statusText, { 
                      color: res.status === 'confirmed' ? '#34C759' : 
                             res.status === 'cancelled' ? '#FF3B30' : '#FF9500' 
                    }]}>{res.status === 'pending' ? 'EN ATTENTE' : res.status === 'confirmed' ? 'ACCEPTÉE' : res.status === 'delayed' ? 'RETARDÉE' : 'ANNULÉE'}</Text>
                  </View>
                </View>

                <View style={styles.reservationActions}>
                  <Text style={styles.seatsText}>{res.seats} place(s) réservée(s)</Text>
                  {res.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.miniButton, { backgroundColor: '#34C759' }]}
                        onPress={() => handleUpdateStatus(res.id, 'confirmed')}
                      >
                        <Text style={styles.miniButtonText}>Accepter</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.miniButton, { backgroundColor: '#FF3B30' }]}
                        onPress={() => promptRefuseReservation(res.id)}
                      >
                        <Text style={styles.miniButtonText}>Refuser</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {res.status === 'confirmed' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.miniButton, { backgroundColor: '#FF3B30' }]}
                        onPress={() => promptCancelConfirmedReservation(res.id)}
                      >
                        <Text style={styles.miniButtonText}>Annuler la réservation</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </Card>
            );
            })
          )}
        </View>
      )}

      <View style={styles.priceContainer}>
        <View>
          <Text style={styles.priceLabel}>Prix Total ({requestedSeats}x)</Text>
          <Text style={styles.totalPrice}>{trip.price * requestedSeats} MRU</Text>
        </View>
        {!isDriver && (
          <Button 
            title="Réserver Maintenant" 
            onPress={handleReserve} 
            loading={reserving}
            disabled={trip.available_seats === 0}
          />
        )}
        {isDriver && (
          <View style={styles.driverActions}>
            <View style={styles.driverTag}>
               <Text style={styles.driverTagText}>VOTRE TRAJET</Text>
            </View>
            <TouchableOpacity style={styles.deleteTripBtn} onPress={handleDeleteTrip}>
              <Text style={styles.deleteTripText}>Supprimer ce trajet</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal Détails du véhicule */}
      <Modal
        visible={showCarDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCarDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Détails du véhicule</Text>
              <TouchableOpacity onPress={() => setShowCarDetails(false)} style={styles.closeBtn}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.carDetailHeader}>
                <View style={[styles.bigIconBadge, { backgroundColor: colors.tint + '15' }]}>
                  <Car size={32} color={colors.tint} />
                </View>
                <Text style={styles.detailBrand}>{trip.cars?.brand}</Text>
                <Text style={styles.detailPlate}>{trip.cars?.plate_number}</Text>
                <Text style={styles.detailSeats}>{trip.cars?.seats} places au total</Text>
              </View>

              <Text style={styles.detailSectionTitle}>Équipements et Options</Text>
              
              <View style={styles.featuresList}>
                <View style={styles.featureRow}>
                  <Wind color={trip.cars?.has_ac ? colors.tint : '#ccc'} size={20} />
                  <Text style={[styles.featureText, !trip.cars?.has_ac && styles.featureTextDisabled]}>
                    Climatiseur
                  </Text>
                  {trip.cars?.has_ac && <CheckCircle color={colors.tint} size={18} style={{marginLeft: 'auto'}} />}
                </View>
                
                <View style={styles.featureRow}>
                  <Briefcase color={trip.cars?.has_luggage ? colors.tint : '#ccc'} size={20} />
                  <Text style={[styles.featureText, !trip.cars?.has_luggage && styles.featureTextDisabled]}>
                    Compartiment bagage
                  </Text>
                  {trip.cars?.has_luggage && <CheckCircle color={colors.tint} size={18} style={{marginLeft: 'auto'}} />}
                </View>
                
                <View style={styles.featureRow}>
                  <Wifi color={trip.cars?.has_wifi ? colors.tint : '#ccc'} size={20} />
                  <Text style={[styles.featureText, !trip.cars?.has_wifi && styles.featureTextDisabled]}>
                    Wi-Fi à bord
                  </Text>
                  {trip.cars?.has_wifi && <CheckCircle color={colors.tint} size={18} style={{marginLeft: 'auto'}} />}
                </View>

                <View style={styles.featureRow}>
                  <Music color={trip.cars?.has_music ? colors.tint : '#ccc'} size={20} />
                  <Text style={[styles.featureText, !trip.cars?.has_music && styles.featureTextDisabled]}>
                    Système audio / Musique
                  </Text>
                  {trip.cars?.has_music && <CheckCircle color={colors.tint} size={18} style={{marginLeft: 'auto'}} />}
                </View>

                <View style={styles.featureRow}>
                  <PawPrint color={trip.cars?.is_pet_friendly ? colors.tint : '#ccc'} size={20} />
                  <Text style={[styles.featureText, !trip.cars?.is_pet_friendly && styles.featureTextDisabled]}>
                    Animaux acceptés
                  </Text>
                  {trip.cars?.is_pet_friendly && <CheckCircle color={colors.tint} size={18} style={{marginLeft: 'auto'}} />}
                </View>
              </View>

              <View style={{marginTop: 20}}>
                <Button title="Fermer" onPress={() => setShowCarDetails(false)} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCard: {
    marginBottom: 24,
  },
  routeContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    paddingBottom: 20,
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTexts: {
    marginLeft: 16,
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
  },
  cityText: {
    fontSize: 20,
    fontWeight: '700',
  },
  verticalLine: {
    height: 30,
    width: 2,
    backgroundColor: '#F2F2F7',
    marginLeft: 11,
    marginVertical: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBox: {
    alignItems: 'center',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },
  driverCard: {
    marginBottom: 16,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00A95C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneText: {
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.6,
  },
  carCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  carInfo: {
    marginLeft: 16,
  },
  carBrand: {
    fontSize: 16,
    fontWeight: '600',
  },
  carPlate: {
    fontSize: 14,
    opacity: 0.5,
  },
  driverView: {
    marginTop: 10,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservationCard: {
    marginBottom: 12,
    padding: 12,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00A95C10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  passengerPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  passengerPhone: {
    fontSize: 13,
    marginLeft: 4,
    color: '#00A95C',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  reservationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  seatsText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  miniButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  miniButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.5,
  },
  driverTag: {
    backgroundColor: '#00A95C10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  driverTagText: {
    color: '#00A95C',
    fontWeight: '800',
    fontSize: 12,
  },
  driverActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  deleteTripBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FF3B3015',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteTripText: {
    color: '#FF3B30',
    fontWeight: '700',
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  priceLabel: {
    opacity: 0.6,
    fontSize: 14,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A95C',
  },
  reservationSettings: {
    marginBottom: 20,
    backgroundColor: '#00A95C05',
    borderWidth: 1,
    borderColor: '#00A95C20',
    borderRadius: 16,
    padding: 16,
  },
  seatSelector: {
    paddingVertical: 5,
  },
  seatLabel: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.8,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  counterBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#00A95C15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    fontSize: 24,
    color: '#00A95C',
    fontWeight: '500',
    lineHeight: 28,
  },
  counterValueContainer: {
    width: 60,
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  chipText: { fontSize: 11, fontWeight: '600' },
  
  // Modal details
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  sheetContent: {
    padding: 24,
    paddingBottom: 40,
  },
  carDetailHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  bigIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailBrand: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailPlate: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 4,
  },
  detailSeats: {
    fontSize: 14,
    color: '#00A95C',
    fontWeight: '600',
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    opacity: 0.8,
  },
  featuresList: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
  },
  featureTextDisabled: {
    opacity: 0.4,
    textDecorationLine: 'line-through',
  },
});
