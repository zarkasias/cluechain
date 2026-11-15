import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const icon = (name: IconName) =>
  function TabIcon({ color: tint }: { color: unknown }) {
    return <Ionicons name={name} size={24} color={typeof tint === 'string' ? tint : color.inkMuted} />;
  };

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.link,
        tabBarInactiveTintColor: color.inkMuted,
        tabBarStyle: {
          backgroundColor: color.bgDeep,
          borderTopWidth: 1,
          borderTopColor: color.hairline,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Play-Bold',
        },
        sceneStyle: { backgroundColor: color.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Play', tabBarIcon: icon('play') }} />
      <Tabs.Screen name="how-to-play" options={{ title: 'Guide', tabBarIcon: icon('book-outline') }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: icon('stats-chart') }} />
    </Tabs>
  );
}
