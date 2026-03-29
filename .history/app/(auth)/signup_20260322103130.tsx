import { StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View } from '../../components/Themed';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { authService } from '../../services/authService';
import { User, Phone, Mail, Lock, ChevronLeft, UserCircle2 } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { UserRole } from '../../types';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('passenger');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];

  const handleSignup = async () => {
    if (!email || !password || !name || !phone) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.signUp(email, password, name, phone, role);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ChevronLeft color={colors.text} size={28} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: 'transparent' }]}>
              <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez la communauté RimTransport</Text>
          </View>

          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'passenger' && { backgroundColor: colors.tint }]}
              onPress={() => setRole('passenger')}
            >
              <Text style={[styles.roleText, role === 'passenger' && { color: '#FFF' }]}>Passager</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'driver' && { backgroundColor: colors.tint }]}
              onPress={() => setRole('driver')}
            >
              <Text style={[styles.roleText, role === 'driver' && { color: '#FFF' }]}>Chauffeur</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Input 
              label="Nom Complet" 
              placeholder="Ahmed Abdellahi" 
              value={name} 
              onChangeText={setName} 
              icon={<User size={20} color={colors.tint} />}
            />
            <Input 
              label="Numéro de téléphone" 
              placeholder="+222 12 34 56 78" 
              value={phone} 
              onChangeText={setPhone} 
              keyboardType="phone-pad" 
              icon={<Phone size={20} color={colors.tint} />}
            />
            <Input 
              label="E-mail" 
              placeholder="exemple@dupont.com" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              icon={<Mail size={20} color={colors.tint} />}
            />
            <Input 
              label="Mot de passe" 
              placeholder="••••••••" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              icon={<Lock size={20} color={colors.tint} />}
            />

            {error ? <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View> : null}

            <Button title="Créer un compte" onPress={handleSignup} loading={loading} />

            <View style={styles.footer}>
              <Text style={{ color: colors.subtitle }}>Vous avez déjà un compte ? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={{ color: colors.tint, fontWeight: '700' }}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
    marginLeft: -10,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    padding: 6,
  },
  roleButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  form: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  errorContainer: {
    backgroundColor: '#FF3B3010',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
