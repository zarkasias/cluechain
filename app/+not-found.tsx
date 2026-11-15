import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { color, radius, space, type } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title} accessibilityRole="header">
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/" replace style={styles.link} accessibilityRole="link" accessibilityLabel="Go to the home screen">
          <Text style={styles.linkText}>Go to the home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.lg,
    padding: space.xl,
    backgroundColor: color.bg,
  },
  title: {
    ...type.title,
    color: color.ink,
    textAlign: 'center',
  },
  link: {
    minHeight: 48,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: color.linkFill,
  },
  linkText: {
    ...type.body,
    fontWeight: '700',
    color: color.white,
  },
});
