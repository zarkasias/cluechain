import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import GameScreen from '@/components/GameScreen';
import { usePlayTimer } from '@/context/GameContext';
import { color } from '@/constants/theme';

export default function PlayTab() {
  usePlayTimer();
  // The tab scene starts at the top of the screen and ends above the tab bar, so
  // KeyboardAvoidingView's padding is already keyboard height minus the tab bar.
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <GameScreen />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.bg,
  },
});
