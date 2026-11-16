import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import GameScreen from '@/components/GameScreen';
import TutorialScreen from '@/components/tutorial/TutorialScreen';
import { useGameState, usePlayTimer } from '@/context/GameContext';
import { color } from '@/constants/theme';

export default function PlayTab() {
  usePlayTimer();
  const { settings } = useGameState();
  // The tab scene starts at the top of the screen and ends above the tab bar, so
  // KeyboardAvoidingView's padding is already keyboard height minus the tab bar.
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      {settings.seenTutorial ? <GameScreen /> : <TutorialScreen />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.bg,
  },
});
