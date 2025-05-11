import { View, Text, StyleSheet } from 'react-native';
import { useGameState } from '@/context/GameContext';

export default function StatsScreen() {
  const { stats } = useGameState();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Your Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.chainsCompleted}</Text>
            <Text style={styles.statLabel}>Chains Completed</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.hintsUsed}</Text>
            <Text style={styles.statLabel}>Hints Used</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.wordsGuessed}</Text>
            <Text style={styles.statLabel}>Words Guessed</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.bestTime ? `${Math.floor(stats.bestTime / 60)}:${(stats.bestTime % 60).toString().padStart(2, '0')}` : '--'}</Text>
            <Text style={styles.statLabel}>Best Time</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f4ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7c4dff',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});