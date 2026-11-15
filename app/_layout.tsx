import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GameProvider, useGameState } from '@/context/GameContext';
import { color } from '@/constants/theme';

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
    <View style={{ flex: 1, backgroundColor: color.bg }}>
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
      // A visible keyboard focus ring (DESIGN_SPEC §10), in the focus token colour.
      const style = document.createElement('style');
      style.textContent =
        `[role="button"]:focus-visible, [role="link"]:focus-visible, [role="tab"]:focus-visible, a:focus-visible ` +
        `{ outline: 3px solid ${color.focus}; outline-offset: 2px; }`;
      document.head.appendChild(style);
      return () => style.remove();
    }
  }, []);

  return (
    <GameProvider>
      <AppShell fontsLoaded={fontsLoaded || !!fontError} />
    </GameProvider>
  );
}
