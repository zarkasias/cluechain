import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GameProvider, useGameState } from '@/context/GameContext';
import { Colors } from '@/constants/Colors';

import './styles/global.css';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { hydrated } = useGameState();
  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      <StatusBar style="light" />
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Play-Regular': require('../assets/fonts/Play-Regular.ttf'),
    'Play-Bold': require('../assets/fonts/Play-Bold.ttf'),
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.body.style.backgroundColor = 'transparent';
      document.documentElement.style.backgroundColor = 'transparent';
    }
  }, []);

  return (
    <GameProvider>
      <AppShell fontsLoaded={fontsLoaded || !!fontError} />
    </GameProvider>
  );
}
