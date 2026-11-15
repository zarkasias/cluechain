import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import GameScreen from '@/components/GameScreen';
import { Colors } from '@/constants/Colors';
import { usePlayTimer } from '@/context/GameContext';

export default function HomeScreen() {
  usePlayTimer();
  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <GameScreen />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
  },
});
