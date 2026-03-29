import React, { useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { authService } from '../../services/authService';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={26} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
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
        headerShown: true,

        // ✅ Centrer le titre
        headerTitleAlign: 'center',

        // 🎨 Couleurs Mauritanie
        headerStyle: {
          backgroundColor: '#006233', // vert
        },
        headerTintColor: '#D4AF37', // or (titre + icons)

        tabBarActiveTintColor: '#D4AF37', // actif
        tabBarInactiveTintColor: '#C1272D', // rouge

        tabBarStyle: {
          backgroundColor: '#006233',
          borderTopColor: '#D4AF37',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trajets',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="map" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Réservations',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}