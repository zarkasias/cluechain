import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GameProvider } from '@/context/GameContext';
import { Platform, View } from 'react-native';

const TabBarIcon = ({ name, color }: { name: keyof typeof Ionicons.glyphMap; color: string }) => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  }}>
    <Ionicons 
      name={name}
      size={22} 
      color={color}
    />
  </View>
);

export default function TabLayout() {
  return (
    <GameProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9',
            height: Platform.OS === 'ios' ? 88 : 64,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            letterSpacing: 0.3,
            marginTop: 0,
          },
          headerStyle: {
            backgroundColor: '#0b89d7',
            borderBottomWidth: 1,
            borderBottomColor: '#f1f5f9',
          },
          headerTintColor: '#0f172a',
          headerTitleStyle: {
            fontSize: 16,
            letterSpacing: 0.5,
            fontWeight: '500',
          },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'ClueChain',
            tabBarLabel: 'Play',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="play" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="how-to-play"
          options={{
            title: 'Guide',
            tabBarLabel: 'Guide',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="book-outline" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarLabel: 'Stats',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="stats-chart" color={color} />
            ),
          }}
        />
      </Tabs>
    </GameProvider>
  );
}