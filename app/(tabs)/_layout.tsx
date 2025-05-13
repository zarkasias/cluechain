import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GameProvider } from '@/context/GameContext';
import { Platform, View } from 'react-native';
import { Colors, Gradients } from '@/constants/Colors';

const TabBarIcon = ({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: focused ? Colors.secondary : 'transparent',
    borderRadius: 30,
    padding: 10,
  }}>
    <Ionicons 
      name={name}
      size={32} 
      color={color}
    />
  </View>
);

export default function TabLayout() {
  return (
    <GameProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.surface,
          tabBarInactiveTintColor: Colors.surfaceHighlight,
          tabBarStyle: {
            backgroundColor: '#60A5FA',
            borderTopWidth: 4,
            borderColor: 'transparent',
            borderTopColor: 'transparent',
            height: Platform.OS === 'ios' ? 88 : 88,
            paddingBottom: Platform.OS === 'ios' ? 28 : 4,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            letterSpacing: 0.3,
            marginTop: 14,
          },
          headerShown: false,
          tabBarBackground: () => (
            <View style={{ flex: 1, backgroundColor: '#60A5FA' }} />
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'ClueChain',
            tabBarLabel: 'Play',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="play" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="how-to-play"
          options={{
            title: 'Guide',
            tabBarLabel: 'Guide',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="book-outline" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarLabel: 'Stats',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="stats-chart" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </GameProvider>
  );
}