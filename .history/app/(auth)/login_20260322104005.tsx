import { 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  useColorScheme, 
  Image,
  Dimensions,
  Animated,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Text, View } from '../../components/Themed';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { authService } from '../../services/authService';
import Colors from '../../constants/Colors';
import { Mail, Lock, CarFront, ChevronLeft, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const router = useRouter();
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme === 'light' || theme === 'dark' ? theme : 'light'];
  const isDark = theme === 'dark';
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      Animated.sequence([
        Animated.timing(buttonScale, { toValue: 0.98, duration: 50, useNativeDriver: true }),
        Animated.spring(buttonScale, { toValue: 1, tension: 100, friction: 10, useNativeDriver: true }),
      ]).start();
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await authService.signIn(email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Échec de la connexion');
      Animated.sequence([
        Animated.timing(buttonScale, { toValue: 0.98, duration: 50, useNativeDriver: true }),
        Animated.spring(buttonScale, { toValue: 1, tension: 100, friction: 10, useNativeDriver: true }),
      ]).start();
    } finally {
      setLoading(false);
    }
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handleLogoPress = () => {
    Animated.sequence([
      Animated.timing(logoScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F8FAFF' }]}>
      {/* Animated Background Gradient */}
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      {/* Animated Floating Shapes */}
      <Animated.View style={[styles.shape1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.shape2, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.shape3, { opacity: fadeAnim }]} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            {/* Logo Section */}
            <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.8}>
              <Animated.View style={[styles.logoWrapper, { transform: [{ scale: logoScale }] }]}>
                <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'} style={styles.logoBlur}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.logoGradient}
                  >
                    <CarFront size={48} color="white" strokeWidth={1.5} />
                  </LinearGradient>
                </BlurView>
              </Animated.View>
            </TouchableOpacity>

            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              Bienvenue
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
              Connectez-vous pour accéder à votre espace
            </Text>

            {/* Form Section */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <View style={[
                  styles.inputIcon,
                  emailFocused && styles.inputIconFocused,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}>
                  <Mail size={20} color={emailFocused ? '#667eea' : (isDark ? '#888' : '#666')} />
                </View>
                <View style={styles.inputFieldContainer}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#888' : '#666' }]}>Adresse e-mail</Text>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFF' : '#1A1A2E' }]}
                    placeholder="exemple@email.com"
                    placeholderTextColor={isDark ? '#555' : '#AAA'}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <View style={[
                  styles.inputIcon,
                  passwordFocused && styles.inputIconFocused,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}>
                  <Lock size={20} color={passwordFocused ? '#667eea' : (isDark ? '#888' : '#666')} />
                </View>
                <View style={styles.inputFieldContainer}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#888' : '#666' }]}>Mot de passe</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.input, styles.passwordInput, { color: isDark ? '#FFF' : '#1A1A2E' }]}
                      placeholder="••••••••"
                      placeholderTextColor={isDark ? '#555' : '#AAA'}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      {showPassword ? 
                        <EyeOff size={20} color={isDark ? '#888' : '#666'} /> : 
                        <Eye size={20} color={isDark ? '#888' : '#666'} />
                      }
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              {/* Error Message */}
              {error ? (
                <Animated.View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              ) : null}

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={[styles.forgotPasswordText, { color: '#667eea' }]}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  onPressIn={handleButtonPressIn}
                  onPressOut={handleButtonPressOut}
                  onPress={handleLogin}
                  activeOpacity={0.9}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginButton}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={styles.loginButtonText}>Se connecter</Text>
                        <ArrowRight size={20} color="white" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Sign Up Link */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }]}>
                  Nouveau sur RimTransport ?
                </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={styles.signUpText}> Créer un compte</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shape1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  shape2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  shape3: {
    position: 'absolute',
    top: height * 0.4,
    left: -100,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
  },
  logoWrapper: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  logoBlur: {
    width: 100,
    height: 100,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  inputIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputIconFocused: {
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
  },
  inputFieldContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  passwordInput: {
    flex: 1,
    borderBottomWidth: 0,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
  signUpText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '700',
  },
  errorContainer: {
    backgroundColor: 'rgba(255,59,48,0.12)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});