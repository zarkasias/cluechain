import React from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useChains, useGameState } from '@/context/GameContext';
import { chainInProgress } from '@/lib/game';
import { color, radius, space, type } from '@/constants/theme';

/** Buttons are full width minus 48 (§6), capped on tablets. */
const SIDE = 24;
const MAX_CONTENT = 420;

export default function LandingPage() {
  const state = useGameState();
  const chains = useChains();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - SIDE * 2, MAX_CONTENT);
  const resume = chainInProgress(chains, state);

  // Replace, so Back doesn't return to the landing page.
  const play = () => router.replace('/(tabs)');

  const label = resume ? `Continue chain ${resume.chainNumber}` : 'Play';

  return (
    <View style={styles.background}>
      <Image
        source={require('@/assets/images/launchscreen.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        accessible={false}
      />
      <LinearGradient
        colors={[color.transparent, color.landingScrim]}
        locations={[0.3, 0.75]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.content, { paddingBottom: insets.bottom + space.xxl + space.lg }]}>
        <View style={[styles.inner, { width: contentWidth }]}>
          <Text style={styles.title} accessibilityRole="header">
            Clue Chains
          </Text>
          <Text style={styles.tagline}>Every answer is the next clue.</Text>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={play}
            accessibilityRole="button"
            accessibilityLabel={resume ? `${label}, link ${resume.linkNumber} of 5` : label}
          >
            <View style={styles.buttonLabel}>
              <Text style={styles.buttonText}>{label}</Text>
              {resume && <Text style={styles.buttonSub}>Link {resume.linkNumber} of 5</Text>}
            </View>
            <ArrowRight size={22} color={color.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: color.bgDeep,
  },
  // The title and button sit in the lower third.
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  inner: {
    alignItems: 'center',
    gap: space.md,
  },
  title: {
    fontFamily: 'Play-Bold',
    fontSize: 52,
    lineHeight: 60,
    color: color.ink,
    textAlign: 'center',
  },
  tagline: {
    ...type.body,
    color: color.ink,
    textAlign: 'center',
    marginBottom: space.xl,
  },
  button: {
    alignSelf: 'stretch',
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: color.linkFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingVertical: space.sm,
  },
  buttonPressed: {
    backgroundColor: color.linkDeep,
  },
  buttonLabel: {
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Play-Bold',
    fontSize: 20,
    color: color.white,
  },
  buttonSub: {
    fontSize: 13,
    lineHeight: 16,
    color: color.white,
  },
});
