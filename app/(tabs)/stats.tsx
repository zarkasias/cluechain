import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGameState } from '@/context/GameContext';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

type StatItemProps = {
  value: string | number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const StatItem = ({ value, label, icon }: StatItemProps) => (
  <View style={styles.statItem}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={20} color="#6366f1" />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

function formatTime(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
}

export default function StatsScreen() {
  const { stats } = useGameState();

  return (
   
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatItem 
            value={stats.totalPoints}
            label="Total Points"
            icon="star"
          />
          <StatItem 
            value={stats.chainsCompleted}
            label="Chains Completed"
            icon="checkmark-circle"
          />
          <StatItem 
            value={stats.hintsUsed}
            label="Hints Used"
            icon="bulb"
          />
          <StatItem 
            value={stats.wordsSolved}
            label="Words Solved"
            icon="text"
          />
          <StatItem 
            value={
              stats.bestTimeMs !== null ? formatTime(stats.bestTimeMs) : '--'
            }
            label="Best Time"
            icon="timer"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  header: {
    marginTop: 18,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: Platform.OS === 'ios' ? '500' : 'bold',
    color: '#fff',
    fontFamily: 'Play-Bold',
    marginBottom: 4,
  },
  statsContainer: {
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
});