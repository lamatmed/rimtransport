import { StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Alert } from 'react-native';
import { Text, View, Card } from '../../components/Themed';
import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { Profile } from '../../types';
import Colors from '../../constants/Colors';
import { User, Phone, LogOut, Car, ChevronRight, Settings, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];

  useEffect(() => {
    loadProfile();
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
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: async () => {
        try {
          await authService.signOut();
          router.replace('/login');
        } catch (e) {
          console.error(e);
        }
      }}
    ]);
  };

  const ProfileOption = ({ icon, title, onPress, showChevron = true, color = colors.text }: any) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <View style={styles.optionLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.border + '50' }]}>
           {icon}
        </View>
        <Text style={[styles.optionTitle, { color }]}>{title}</Text>
      </View>
      {showChevron && <ChevronRight size={20} color={colors.subtitle} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <User size={40} color="#FFF" />
        </View>
        <Text style={styles.name}>{profile?.name || 'Chargement...'}</Text>
        <Text style={styles.roleTag}>{profile?.role === 'driver' ? 'CHAUFFEUR' : 'PASSAGER'}</Text>
        <View style={styles.infoPill}>
          <Phone size={14} color={colors.subtitle} />
          <Text style={styles.phoneText}>{profile?.phone}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <Card style={styles.optionsCard}>
          <ProfileOption 
            icon={<User size={20} color={colors.tint} />} 
            title="Infos Personnelles" 
            onPress={() => {}} 
          />
          {profile?.role === 'driver' && (
            <ProfileOption 
              icon={<Car size={20} color={colors.tint} />} 
              title="Mes Véhicules" 
              onPress={() => router.push('/my-cars')} 
            />
          )}
          <ProfileOption 
            icon={<Settings size={20} color={colors.tint} />} 
            title="Paramètres" 
            onPress={() => {}} 
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plus</Text>
        <Card style={styles.optionsCard}>
          <ProfileOption 
            icon={<Info size={20} color={colors.tint} />} 
            title="Aide & Support" 
            onPress={() => {}} 
          />
          <ProfileOption 
            icon={<LogOut size={20} color="#FF3B30" />} 
            title="Déconnexion" 
            onPress={handleLogout} 
            showChevron={false}
            color="#FF3B30"
          />
        </Card>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  roleTag: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.5,
    marginTop: 4,
    letterSpacing: 1,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  phoneText: {
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.6,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
    opacity: 0.6,
  },
  optionsCard: {
    padding: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    opacity: 0.4,
    fontSize: 12,
    marginTop: 20,
  }
});
