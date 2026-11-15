import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ColorValue, Platform, View } from 'react-native';
import { Colors } from '@/constants/Colors';

const TabBarIcon = ({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: ColorValue; focused: boolean }) => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: Platform.OS === 'ios' ? 4 : 12,
    marginTop: Platform.OS === 'ios' ? 0 : 0,
  }}>
    <Ionicons 
      name={name}
      size={Platform.OS === 'ios' ? 22 : 32} 
      color={focused ? Colors.secondary : typeof color === 'string' ? color : Colors.surfaceHighlight}
    />
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.surface,
        tabBarInactiveTintColor: Colors.surfaceHighlight,
        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopWidth: 4,
          borderColor: 'transparent',
          borderTopColor: 'transparent',
          height: Platform.OS === 'ios' ? 96 : 88,
          paddingBottom: Platform.OS === 'ios' ? 28 : 4,
          paddingTop: Platform.OS === 'ios' ? 8 : 8,
        },
        tabBarLabelStyle: {
          fontSize: Platform.OS === 'ios' ? 14 : 16,
          letterSpacing: 0.3,
          marginTop: Platform.OS === 'ios' ? 6 : 14,
          fontFamily: 'Play-Bold',
        },
        headerShown: false,
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: Colors.primary }} />
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
  );
}