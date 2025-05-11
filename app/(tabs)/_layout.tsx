import { Tabs } from 'expo-router';
import { PhoneIncoming as HomeIcon, Info as InfoIcon, Trophy as TrophyIcon } from 'lucide-react-native';
import { GameProvider } from '@/context/GameContext';

export default function TabLayout() {
  return (
    <GameProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#7c4dff',
          tabBarInactiveTintColor: '#9e9e9e',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: '#7c4dff',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'ClueChain',
            tabBarLabel: 'Play',
            tabBarIcon: ({ color, size }) => (
              <HomeIcon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="how-to-play"
          options={{
            title: 'How To Play',
            tabBarLabel: 'How To Play',
            tabBarIcon: ({ color, size }) => (
              <InfoIcon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Statistics',
            tabBarLabel: 'Stats',
            tabBarIcon: ({ color, size }) => (
              <TrophyIcon size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </GameProvider>
  );
}