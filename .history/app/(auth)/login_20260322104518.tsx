import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useColorScheme, Image } from 'react-native';
import { Text, View } from '../../components/Themed';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { authService } from '../../services/authService';
import Colors from '../../constants/Colors';
import { Mail, Lock, CarFront, ChevronLeft } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.signIn(email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Échec de la connexion');
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
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: 'transparent' }]}>
              <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.title}>RimTransport</Text>
            <Text style={styles.subtitle}>Connectez-vous pour continuer votre trajet</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="E-mail"
              placeholder="exemple@mail.com"
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

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={{ color: colors.tint, fontWeight: '600' }}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <Button 
              title="Se connecter" 
              onPress={handleLogin} 
              loading={loading}
            />

            <View style={styles.footer}>
              <Text style={{ color: colors.subtitle }}>Vous n'avez pas de compte ? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={{ color: colors.tint, fontWeight: '700' }}>S'inscrire</Text>
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
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
    marginLeft: -10,
  },
  header: {
    marginBottom: 40,
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
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
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
