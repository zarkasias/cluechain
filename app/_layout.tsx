import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { Platform } from 'react-native';
import { Slot } from 'expo-router';
import { GameProvider } from '@/context/GameContext';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Colors } from '@/constants/Colors';

import './styles/global.css';

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.body.style.backgroundColor = 'transparent';
      document.documentElement.style.backgroundColor = 'transparent';
    }
  }, []);

  useEffect(() => {
    Font.loadAsync({
      'Play-Regular': require('../assets/fonts/Play-Regular.ttf'),
      'Play-Bold': require('../assets/fonts/Play-Bold.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GameProvider>
      <View style={{ flex: 1, backgroundColor: Colors.primary }}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <Slot />
      </View>
    </GameProvider>
  );
}
