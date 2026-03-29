import { StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Alert, Dimensions, Animated, View as RNView, Modal, Image } from 'react-native';
import { Text, View, Card } from '../../components/Themed';
import { useEffect, useState, useRef } from 'react';
import { authService } from '../../services/authService';
import { reservationService } from '../../services/reservationService';
import { tripService } from '../../services/tripService';
import { carService } from '../../services/carService';
import { Profile } from '../../types';
import Colors from '../../constants/Colors';
import { 
  User, 
  Car, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Award, 
  Clock, 
  Users, 
  Phone, 
  Camera,
  Edit2,
  Shield,
  Lock
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import Button from '../../components/Button';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../_layout';
import { LanguageService } from '../../services/i18n';

const { width } = Dimensions.get('window');

type RelatedPerson = { id: string; name: string; phone: string };

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [relatedPeople, setRelatedPeople] = useState<RelatedPerson[]>([]);
  const [activityCount, setActivityCount] = useState(0);
  const [carsCount, setCarsCount] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];
  const { t } = LanguageService;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Couleurs du drapeau mauritanien
  const mauritaniaGreen = '#00A95C';
  const mauritaniaGold = '#FFD700';
  const mauritaniaRed = '#C60C30';

  useEffect(() => {
    loadProfile();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadRelatedInsights = async (p: Profile & { id?: string }) => {
    const id = p.id as any;
    if (!id) return;
    try {
      if (p.role === 'driver') {
        const cars = await carService.getDriverCars(id);
        setCarsCount(cars.length);

        const reservations = await reservationService.getDriverReservations(id);
        const byId = new Map<string, RelatedPerson>();
        for (const r of reservations) {
          const passenger = r.profiles;
          if (passenger?.id && passenger.name) {
            byId.set(String(passenger.id), {
              id: String(passenger.id),
              name: passenger.name,
              phone: passenger.phone ?? '—',
            });
          }
        }
        setRelatedPeople([...byId.values()]);
        const trips = await tripService.getDriverTrips(id);
        setActivityCount(trips.length);
      } else {
        const availableTrips = await tripService.listTrips();
        setCarsCount(availableTrips.length);

        const reservations = await reservationService.getUserReservations(id);
        const byId = new Map<string, RelatedPerson>();
        for (const r of reservations) {
          const driver = r.trips?.profiles;
          if (driver?.id && driver.name) {
            byId.set(String(driver.id), {
              id: String(driver.id),
              name: driver.name,
              phone: driver.phone ?? '—',
            });
          }
        }
        setRelatedPeople([...byId.values()]);
        setActivityCount(reservations.length);
      }
    } catch (e) {
      console.error(e);
      setRelatedPeople([]);
      setActivityCount(0);
    }
  };

  const loadProfile = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const data = await authService.getProfile(user.id);
      setProfile(data as any);
      setEditName((data as any)?.name ?? '');
      setEditPhone((data as any)?.phone ?? '');
      await loadRelatedInsights(data as Profile);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      t('logout_confirm_title'), 
      t('logout_confirm_msg'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('logout'), 
          style: 'destructive', 
          onPress: async () => {
            try {
              await authService.signOut();
              router.replace('/login');
            } catch (e) {
              console.error(e);
            }
          }
        }
      ]
    );
  };

  const handleToggleLanguage = () => {
    Alert.alert(
      t('language'),
      'Choisissez votre langue / اختر لغتك',
      [
        { text: 'Français', onPress: () => setLocale('fr') },
        { text: 'العربية', onPress: () => setLocale('ar') },
        { text: t('cancel'), style: 'cancel' }
      ]
    );
  };

  const ProfileOption = ({ icon, title, onPress, showChevron = true, color = colors.text, badge }: any) => (
    <TouchableOpacity 
      style={[styles.option, { borderBottomColor: colors.border + '20' }]} 
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.optionLeft}>
        <View style={[styles.iconContainer, { backgroundColor: mauritaniaGreen + '15' }]}>
          {icon}
        </View>
        <View>
          <Text style={[styles.optionTitle, { color }]}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
        </View>
      </View>
      {showChevron && <ChevronRight size={20} color={colors.subtitle} strokeWidth={1.5} />}
    </TouchableOpacity>
  );

  const StatCard = ({ icon, value, label }: any) => (
    <View style={[styles.statCard, { backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFF' }]}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={[styles.statValue, { color: mauritaniaGreen }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.subtitle }]}>{label}</Text>
    </View>
  );

  const formatMemberSince = (value?: string | number | null) => {
    if (!value && value !== 0) return t('not_specified');
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return t('not_specified');
    return parsedDate.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'fr-FR', { numberingSystem: 'latn' });
  };

  const formatMemberDuration = (value?: string | number | null) => {
    if (!value && value !== 0) return '--';
    const createdDate = new Date(value);
    if (Number.isNaN(createdDate.getTime())) return '--';

    const now = Date.now();
    const diffMs = Math.max(0, now - createdDate.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (days < 30) {
      return `${days} ${days > 1 ? t('days') : t('day')}`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} ${t('months')}`;
    }

    const years = Math.floor(months / 12);
    return `${years} ${years > 1 ? t('years') : t('year')}`;
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;

    const name = editName.trim();
    const phone = editPhone.trim();

    if (!name) {
      Alert.alert(t('required_field'), t('name_required'));
      return;
    }
    if (!phone) {
      Alert.alert(t('required_field'), t('phone_required'));
      return;
    }

    try {
      setSaving(true);
      const updated = await authService.updateProfile(profile.id as any, {
        name,
        phone,
      });
      setProfile(updated as any);
      Alert.alert(t('success'), t('info_updated'));
      setShowInfoModal(false);
    } catch (e) {
      console.error(e);
      Alert.alert(t('error'), t('update_profile_failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('error'), t('fill_all_fields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwords_dont_match'));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t('error'), t('password_too_short'));
      return;
    }

    setChangingPassword(true);
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        await authService.changePassword(user.id, oldPassword.trim(), newPassword.trim());
        Alert.alert(t('success'), t('password_changed_success'));
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (e: any) {
      const errorMsg = e.message || '';
      if (errorMsg.includes('Incorrect current password')) {
        Alert.alert(t('error'), t('incorrect_current_password'));
      } else {
        Alert.alert(t('error'), errorMsg || t('op_failed'));
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePickProfilePhoto = async () => {
    if (!profile?.id) return;
    try {
      setUploadingPhoto(true);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('permission_denied'), t('gallery_access_required'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const mimeType = asset.mimeType || 'image/jpeg';

      // Convex: 1) generate upload URL
      const uploadUrl = await authService.generateProfilePhotoUploadUrl();

      // 2) upload file contents to that URL (response returns storageId)
      const uploadResponse = await fetch(uploadUrl as any, {
        method: 'POST',
        headers: { 'Content-Type': mimeType },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error('Échec de l’upload de la photo.');
      }

      const { storageId } = await uploadResponse.json();
      if (!storageId) throw new Error('storageId manquant après upload.');

      // 3) store storageId on profile document
      const updated = await authService.setProfilePhoto(profile.id as any, storageId);
      setProfile(updated as any);
      Alert.alert(t('success'), t('photo_updated'));
    } catch (e: any) {
      console.error(e);
      Alert.alert(t('error'), e?.message || t('update_photo_failed'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={[styles.headerContainer]}>
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarBorder, { borderColor: mauritaniaGold }]}>
              <View style={[styles.avatar, { backgroundColor: mauritaniaGreen }]}>
                {profile?.photoUrl ? (
                  <Image source={{ uri: profile.photoUrl }} style={styles.profilePhotoImage} />
                ) : (
                  <User size={48} color="#FFF" />
                )}
              </View>
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: '#FFF' }]}>
              <Shield size={16} color={mauritaniaGold} />
            </View>
          </View>
          
          <Text style={[styles.name, { color: '#0a0909' }]}>{profile?.name || 'Chargement...'}</Text>
          
          <View style={styles.roleContainer}>
            <View style={[styles.roleBadge, { backgroundColor: mauritaniaGreen }]}>
              <Text style={styles.roleTag}>
                {profile?.role === 'driver' ? `🚗 ${t('role_driver').toUpperCase()}` : `👤 ${t('role_passenger').toUpperCase()}`}
              </Text>
            </View>
          </View>
          
          <View style={[styles.infoPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Phone size={14} color={mauritaniaGreen} />
            <Text style={[styles.phoneText, { color: '#0b0a0a' }]}>{profile?.phone}</Text>
          </View>
        </Animated.View>
      </View>

      {/* Cartes de statistiques */}
      <Animated.View 
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
        <StatCard 
          icon={<Car size={20} color={mauritaniaGold} />}
          value={String(carsCount)}
          label={profile?.role === 'driver' ? t('vehicles') : t('available_trips')}
        />
        <StatCard 
          icon={<Award size={20} color={mauritaniaGold} />}
          value={String(activityCount)}
          label={profile?.role === 'driver' ? t('trips') : t('reservations')}
        />
        <StatCard 
          icon={<Clock size={20} color={mauritaniaGold} />}
          value={formatMemberDuration(
            (profile as any)?.created_at ??
            (profile as any)?.createdAt ??
            (profile as any)?._creationTime
          )}
          label={t('member')}
        />
      </Animated.View>

      {/* Infos complémentaires */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {profile?.role === 'driver' ? t('passengers_on_trips') : t('drivers_on_trips')}
          </Text>
          <Card style={[styles.insightsCard, { backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.insightsHeader}>
              <Users size={22} color={mauritaniaGreen} />
              <Text style={[styles.insightsSubtitle, { color: colors.subtitle }]}>
                {profile?.role === 'driver'
                  ? `${relatedPeople.length} ${t('unique_passengers')}`
                  : `${relatedPeople.length} ${t('unique_drivers')}`}
              </Text>
            </View>
            {relatedPeople.length === 0 ? (
              <Text style={[styles.insightsEmpty, { color: colors.subtitle }]}>
                {profile?.role === 'driver'
                  ? t('no_driver_res')
                  : t('no_passenger_res')}
              </Text>
            ) : (
              relatedPeople.slice(0, 12).map((person) => (
                <View
                  key={person.id}
                  style={[styles.insightRow, { borderBottomColor: colors.border + '30' }]}
                >
                  <View style={[styles.insightAvatar, { backgroundColor: mauritaniaGreen + '18' }]}>
                    <User size={18} color={mauritaniaGreen} />
                  </View>
                  <View style={styles.insightTextBlock}>
                    <Text style={[styles.insightName, { color: colors.text }]}>{person.name}</Text>
                    <View style={styles.insightPhoneRow}>
                      <Phone size={14} color={colors.subtitle} />
                      <Text style={[styles.insightPhone, { color: colors.subtitle }]}>{person.phone}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </Card>
        </View>
      </Animated.View>

      {/* Sections */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('account')}</Text>
          <Card style={[styles.optionsCard, { backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFF' }]}>
            <ProfileOption 
              icon={<User size={20} color={mauritaniaGreen} />} 
              title={t('personal_info')} 
              onPress={() => setShowInfoModal(true)} 
            />
            {profile?.role === 'driver' && (
              <ProfileOption 
                icon={<Car size={20} color={mauritaniaGreen} />} 
                title={t('my_cars')} 
                onPress={() => router.push('/my-cars')} 
              />
            )}
            <ProfileOption 
              icon={<Settings size={20} color={mauritaniaGreen} />} 
              title={t('language')} 
              onPress={handleToggleLanguage} 
              badge={locale.toUpperCase()}
            />
            <ProfileOption 
              icon={<Lock size={20} color={mauritaniaGreen} />} 
              title={t('change_password')} 
              onPress={() => setShowPasswordModal(true)} 
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('support')}</Text>
          <Card style={[styles.optionsCard, { backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFF' }]}>
            <ProfileOption 
              icon={<HelpCircle size={20} color={mauritaniaGreen} />} 
              title={t('help_support')} 
              onPress={() => router.push('/help')} 
            />
            <ProfileOption 
              icon={<LogOut size={20} color={mauritaniaRed} />} 
              title={t('logout')} 
              onPress={handleLogout} 
              showChevron={false}
              color={mauritaniaRed}
            />
          </Card>
        </View>

        <Text style={[styles.version, { color: colors.subtitle }]}>Version 1.0.0</Text>
      </Animated.View>

      {/* Modal Infos Personnelles */}
      <Modal
        visible={showInfoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <RNView style={styles.modalOverlay}>
          <RNView style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('personal_info')}</Text>
              <TouchableOpacity onPress={() => setShowInfoModal(false)} style={styles.closeBtn}>
                <Text style={{ fontSize: 16, color: mauritaniaGreen, fontWeight: '600' }}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.photoSection}>
                <Text style={styles.photoLabel}>{t('profile_photo')}</Text>
                <View style={[styles.photoPreview, { backgroundColor: mauritaniaGreen + '15' }]}>
                  {profile?.photoUrl ? (
                    <Image source={{ uri: profile.photoUrl }} style={styles.photoPreviewImage} />
                  ) : (
                    <User size={30} color={mauritaniaGreen} />
                  )}
                </View>
                <Button
                  title={uploadingPhoto ? t('updating') : t('change_photo')}
                  onPress={handlePickProfilePhoto}
                  loading={uploadingPhoto}
                />
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('fullname_label')}</Text>
                <Input
                  value={editName}
                  onChangeText={setEditName}
                  placeholder={t('fullname_placeholder')}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('phone_label')}</Text>
                <Input
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder={t('phone_placeholder')}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('account_type')}</Text>
                <Text style={styles.infoValue}>
                  {profile?.role === 'driver' ? t('role_driver') : t('role_passenger')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('member_since')}</Text>
                <Text style={styles.infoValue}>
                  {formatMemberSince(
                    (profile as any)?.created_at ??
                    (profile as any)?.createdAt ??
                    (profile as any)?._creationTime
                  )}
                </Text>
              </View>
              <Button title={t('save')} onPress={handleSaveProfile} loading={saving} />
            </ScrollView>
          </RNView>
        </RNView>
      </Modal>

      {/* Modal Changement de Mot de Passe */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowPasswordModal(false);
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}
      >
        <RNView style={styles.modalOverlay}>
          <RNView style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('change_password')}</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowPasswordModal(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }} 
                style={styles.closeBtn}
              >
                <Text style={{ fontSize: 16, color: mauritaniaGreen, fontWeight: '600' }}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('current_password')}</Text>
                <Input
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('new_password')}</Text>
                <Input
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('confirm_new_password')}</Text>
                <Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              <Button 
                title={t('save')} 
                onPress={handleChangePassword} 
                loading={changingPassword} 
              />
            </ScrollView>
          </RNView>
        </RNView>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    padding: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  roleContainer: {
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 8,
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 30,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginLeft: 4,
  },
  insightsCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  insightsSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  insightsEmpty: {
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 8,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  insightAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTextBlock: {
    flex: 1,
  },
  insightName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightPhone: {
    fontSize: 14,
  },
  optionsCard: {
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    marginTop: 2,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
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
  infoRow: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  profilePhotoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  photoSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  photoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
    fontWeight: '600',
  },
  photoPreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
  },
});