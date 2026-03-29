import { StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Alert, Dimensions, Animated, View as RNView } from 'react-native';
import { Text, View, Card } from '../../components/Themed';
import { useEffect, useState, useRef } from 'react';
import { authService } from '../../services/authService';
import { Profile } from '../../types';
import Colors from '../../constants/Colors';
import { User, Phone, LogOut, Car, ChevronRight, Settings, Info, Star, Award, Clock, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];
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

  const loadProfile = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const data = await authService.getProfile(user.id);
      setProfile(data as any);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion', 
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Se déconnecter', 
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
          )}
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
              <View style={[styles.avatar, { backgroundColor: mauritaniaRed }]}>
                <User size={48} color="#FFF" />
              </View>
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: '#04a026' }]}>
              <Shield size={16} color={mauritaniaGold} />
            </View>
          </View>
          
          <Text style={[styles.name]}>{profile?.name || 'Chargement...'}</Text>
          
          <View style={styles.roleContainer}>
            <View style={[styles.roleBadge, { backgroundColor: mauritaniaGold }]}>
              <Text style={styles.roleTag}>
                {profile?.role === 'driver' ? '🚗 CHAUFFEUR' : '👤 PASSAGER'}
              </Text>
            </View>
          </View>
          
          <View style={[styles.infoPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Phone size={14} color={mauritaniaGold} />
            <Text style={[styles.phoneText, { color: '#201717' }]}>{profile?.phone}</Text>
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
          icon={<Star size={20} color={mauritaniaGold} />}
          value="4.9"
          label="Évaluation"
        />
        <StatCard 
          icon={<Award size={20} color={mauritaniaGold} />}
          value="24"
          label="Courses"
        />
        <StatCard 
          icon={<Clock size={20} color={mauritaniaGold} />}
          value="2 ans"
          label="Membre"
        />
      </Animated.View>

      {/* Sections */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Compte</Text>
          <Card style={[styles.optionsCard, { backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFF' }]}>
            <ProfileOption 
              icon={<User size={20} color={mauritaniaGreen} />} 
              title="Infos Personnelles" 
              onPress={() => {}} 
            />
            {profile?.role === 'driver' && (
              <ProfileOption 
                icon={<Car size={20} color={mauritaniaGreen} />} 
                title="Mes Véhicules" 
                onPress={() => router.push('/my-cars')} 
              />
            )}
            <ProfileOption 
              icon={<Settings size={20} color={mauritaniaGreen} />} 
              title="Paramètres" 
              onPress={() => {}} 
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          <Card style={[styles.optionsCard, { backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFF' }]}>
            <ProfileOption 
              icon={<Info size={20} color={mauritaniaGreen} />} 
              title="Aide & Support" 
              onPress={() => {}} 
            />
            <ProfileOption 
              icon={<LogOut size={20} color={mauritaniaRed} />} 
              title="Déconnexion" 
              onPress={handleLogout} 
              showChevron={false}
              color={mauritaniaRed}
            />
          </Card>
        </View>

        <Text style={[styles.version, { color: colors.subtitle }]}>Version 1.0.0</Text>
      </Animated.View>
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
  }
});