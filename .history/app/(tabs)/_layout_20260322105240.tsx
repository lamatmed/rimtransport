import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { authService } from '../../services/authService';

// Couleurs du drapeau de la Mauritanie
const MAURITANIA_COLORS = {
  green: '#00A95C',    // Vert symbolique
  gold: '#FFD700',     // Or / Jaune
  red: '#C60C30',      // Rouge
  darkGreen: '#007A44', // Vert foncé pour les variations
  lightGold: '#FFE55C', // Or clair
};

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused?: boolean;
}) {
  return (
    <View style={styles.iconContainer}>
      <FontAwesome 
        size={24} 
        style={[styles.icon, props.focused && styles.iconFocused]} 
        {...props} 
      />
      {props.focused && <View style={styles.iconDot} />}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await authService.getCurrentUser();
    if (!user) {
      router.replace('/login');
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MAURITANIA_COLORS.gold,
        tabBarInactiveTintColor: theme === 'dark' ? '#888' : '#999',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? MAURITANIA_COLORS.darkGreen : MAURITANIA_COLORS.green,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: theme === 'dark' ? MAURITANIA_COLORS.darkGreen : MAURITANIA_COLORS.green,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: MAURITANIA_COLORS.gold + '30',
        },
        headerTitleStyle: {
          color: MAURITANIA_COLORS.gold,
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTintColor: MAURITANIA_COLORS.gold,
        headerTitleAlign: 'center',
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trajets',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="map" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Réservations',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    marginBottom: 2,
  },
  iconFocused: {
    transform: [{ scale: 1.1 }],
  },
  iconDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: MAURITANIA_COLORS.gold,
  },
});