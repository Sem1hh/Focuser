import React, { useState, useEffect } from 'react';
import { DeviceEventEmitter, StatusBar, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getSettings } from './src/utils/storage';
// YENİ: Font Paketleri
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

import HomeScreen from './src/screens/HomeScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isDark, setIsDark] = useState(false);

  // YENİ: Fontları Yükle
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    const loadTheme = async () => {
      const settings = await getSettings();
      setIsDark(settings.darkMode);
    };
    loadTheme();
    const listener = DeviceEventEmitter.addListener('theme_change', (mode) => setIsDark(mode));
    return () => listener.remove();
  }, []);

  // Fontlar yüklenmeden uygulamayı açma (Yükleniyor ikonu göster)
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  const MyTheme = isDark ? DarkTheme : DefaultTheme;
  const iconColor = isDark ? '#fff' : 'gray';
  const activeColor = 'tomato';
  
  const screenOptions = ({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;
      if (route.name === 'Ana Sayfa') iconName = focused ? 'timer' : 'timer-outline';
      else if (route.name === 'Raporlar') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
      else if (route.name === 'Ayarlar') iconName = focused ? 'settings' : 'settings-outline';
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: activeColor,
    tabBarInactiveTintColor: iconColor,
    headerStyle: { backgroundColor: isDark ? '#121212' : '#fff' },
    headerTintColor: isDark ? '#fff' : '#333',
    // YENİ: Başlık Fontu
    headerTitleStyle: { fontFamily: 'Poppins_700Bold' },
    tabBarStyle: {
      backgroundColor: isDark ? '#121212' : '#fff',
      borderTopColor: isDark ? '#333' : '#e0e0e0',
      height: 60, // Barı biraz yükselttik
      paddingBottom: 8,
    },
    tabBarLabelStyle: { fontFamily: 'Poppins_400Regular', fontSize: 12 }
  });

  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
        <Tab.Screen name="Raporlar" component={ReportsScreen} />
        <Tab.Screen name="Ayarlar" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}