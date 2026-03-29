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
  const emailShake = useRef(new Animated.Value(0)).current;
  const passwordShake = useRef(new Animated.Value(0)).current;

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

  const shakeAnimation = (shakeValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(shakeValue, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email) {
      setError('Veuillez entrer votre adresse e-mail');
      shakeAnimation(emailShake);
      Animated.sequence([
        Animated.timing(buttonScale, { toValue: 0.98, duration: 50, useNativeDriver: true }),
        Animated.spring(buttonScale, { toValue: 1, tension: 100, friction: 10, useNativeDriver: true }),
      ]).start();
      return;
    }
    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      shakeAnimation(passwordShake);
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

  const primaryColor = '#6366F1';
  const primaryLight = '#818CF8';
  const primaryDark = '#4F46E5';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F0F1A' : '#FFFFFF' }]}>
      {/* Modern Background with Abstract Shapes */}
      <View style={[styles.bgGradient, { backgroundColor: isDark ? '#0F0F1A' : '#FFFFFF' }]}>
        <View style={[styles.bgCircle1, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)' }]} />
        <View style={[styles.bgCircle2, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)' }]} />
        <View style={[styles.bgCircle3, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.06)' : 'rgba(236, 72, 153, 0.04)' }]} />
        <View style={[styles.bgDots, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]} />
      </View>
      
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
                <View style={[styles.logoContainer, { backgroundColor: primaryColor }]}>
                  <CarFront size={48} color="white" strokeWidth={1.5} />
                </View>
              </Animated.View>
            </TouchableOpacity>

            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F0F1A' }]}>
              Bon retour
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#8E8E9E' : '#6B6B7F' }]}>
              Connectez-vous pour reprendre la route
            </Text>

            {/* Form Section */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <Animated.View style={{ transform: [{ translateX: emailShake }] }}>
                <View style={styles.inputGroup}>
                  <View style={[styles.inputHeader, { marginBottom: 8 }]}>
                    <Mail size={18} color={emailFocused ? primaryColor : (isDark ? '#8E8E9E' : '#9CA3AF')} />
                    <Text style={[styles.inputLabel, { color: isDark ? '#8E8E9E' : '#6B6B7F' }]}>
                      Adresse e-mail
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: isDark ? '#1C1C2A' : '#F5F5FA',
                        color: isDark ? '#FFFFFF' : '#0F0F1A',
                        borderColor: emailFocused ? primaryColor : 'transparent'
                      }
                    ]}
                    placeholder="exemple@email.com"
                    placeholderTextColor={isDark ? '#5E5E6E' : '#B0B0C0'}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </Animated.View>

              {/* Password Input */}
              <Animated.View style={{ transform: [{ translateX: passwordShake }] }}>
                <View style={styles.inputGroup}>
                  <View style={[styles.inputHeader, { marginBottom: 8 }]}>
                    <Lock size={18} color={passwordFocused ? primaryColor : (isDark ? '#8E8E9E' : '#9CA3AF')} />
                    <Text style={[styles.inputLabel, { color: isDark ? '#8E8E9E' : '#6B6B7F' }]}>
                      Mot de passe
                    </Text>
                  </View>
                  <View style={[
                    styles.passwordWrapper,
                    { 
                      backgroundColor: isDark ? '#1C1C2A' : '#F5F5FA',
                      borderColor: passwordFocused ? primaryColor : 'transparent'
                    }
                  ]}>
                    <TextInput
                      style={[
                        styles.passwordInput, 
                        { color: isDark ? '#FFFFFF' : '#0F0F1A' }
                      ]}
                      placeholder="••••••••"
                      placeholderTextColor={isDark ? '#5E5E6E' : '#B0B0C0'}
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
                        <EyeOff size={20} color={isDark ? '#8E8E9E' : '#9CA3AF'} /> : 
                        <Eye size={20} color={isDark ? '#8E8E9E' : '#9CA3AF'} />
                      }
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
              
              {/* Error Message */}
              {error ? (
                <Animated.View style={[styles.errorContainer, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)' }]}>
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              ) : null}

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={[styles.forgotPasswordText, { color: primaryColor }]}>
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
                  style={[styles.loginButton, { backgroundColor: primaryColor }]}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Se connecter</Text>
                      <ArrowRight size={20} color="white" />
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: isDark ? '#2C2C3A' : '#EFEFF5' }]} />
                <Text style={[styles.dividerText, { color: isDark ? '#8E8E9E' : '#B0B0C0' }]}>ou</Text>
                <View style={[styles.dividerLine, { backgroundColor: isDark ? '#2C2C3A' : '#EFEFF5' }]} />
              </View>

              {/* Social Login */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? '#1C1C2A' : '#F5F5FA' }]}>
                  <Text style={[styles.socialIcon, { color: isDark ? '#FFFFFF' : '#0F0F1A' }]}>G</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? '#1C1C2A' : '#F5F5FA' }]}>
                  <Text style={[styles.socialIcon, { color: isDark ? '#FFFFFF' : '#0F0F1A' }]}>𝕏</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? '#1C1C2A' : '#F5F5FA' }]}>
                  <Text style={[styles.socialIcon, { color: isDark ? '#FFFFFF' : '#0F0F1A' }]}>f</Text>
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: isDark ? '#8E8E9E' : '#6B6B7F' }]}>
                  Pas encore de compte ?
                </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={[styles.signUpText, { color: primaryColor }]}> S'inscrire</Text>
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
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
  },
  bgCircle3: {
    position: 'absolute',
    top: height * 0.3,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  bgDots: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
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
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 56,
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
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
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
  },
  signUpText: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorContainer: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});