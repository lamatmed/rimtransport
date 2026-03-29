import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { authService } from '../../services/authService';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
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
        tabBarActiveTintColor: '#3b4d4b', // Rouge du drapeau mauritanien
        tabBarInactiveTintColor: Colors[theme === 'light' || theme === 'dark' ? theme : 'light'].tint,
        headerShown: true,
        headerTitleAlign: 'center', // Titre centré
        headerStyle: {
          backgroundColor: '#00A95C', // Vert du drapeau mauritanien
        },
        headerTitleStyle: {
          color: '#f8f7ef', // Or pour le texte du titre
          fontWeight: 'bold',
        },
        headerTintColor: '#FFD700', // Couleur des boutons de navigation (retour, etc.)
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trajets',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Réservations',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}