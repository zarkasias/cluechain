import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import type { ChainResult } from '@/lib/game';
import { color, radius, space, type } from '@/constants/theme';

type CompletionCardProps =
  | { kind: 'chain'; title: string; result: ChainResult; onNext: () => void; onReplay: () => void }
  | { kind: 'all'; onPlayFirst: () => void };

// Placeholder until the recap screen (phase 04).
export default function CompletionCard(props: CompletionCardProps) {
  if (props.kind === 'all') {
    return (
      <View style={styles.card}>
        <Text style={styles.heading} accessibilityRole="header">
          You finished every chain!
        </Text>
        <Text style={styles.body}>New chains are coming soon.</Text>
        <Pressable
          style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
          onPress={props.onPlayFirst}
          accessibilityRole="button"
          accessibilityLabel="Replay the first chain"
        >
          <Text style={styles.primaryText}>Replay chain 1</Text>
        </Pressable>
      </View>
    );
  }

  const { title, result, onNext, onReplay } = props;
  return (
    <View style={styles.card}>
      <Text style={styles.heading} accessibilityRole="header">
        Chain complete!
      </Text>
      <Text style={styles.body}>{title}</Text>
      <View style={styles.stars} accessible accessibilityLabel={`${result.stars} of 3 stars`}>
        {[1, 2, 3].map((n) => (
          <Star
            key={n}
            size={32}
            color={color.gold}
            fill={n <= result.stars ? color.gold : 'transparent'}
          />
        ))}
      </View>
      <Text style={styles.score}>{result.score} points</Text>
      <Pressable
        style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Next chain"
      >
        <Text style={styles.primaryText}>Next chain →</Text>
      </Pressable>
      <Pressable
        style={styles.tertiary}
        onPress={onReplay}
        accessibilityRole="button"
        accessibilityLabel="Replay this chain. Replays don't change your stats."
      >
        <Text style={styles.tertiaryText}>Replay (doesn't change stats)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.card,
    borderRadius: radius.lg,
    padding: space.xl,
    gap: space.md,
    alignItems: 'center',
    shadowColor: color.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heading: {
    ...type.display,
    color: color.cardInk,
    textAlign: 'center',
  },
  body: {
    ...type.body,
    color: color.cardMuted,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: space.sm,
  },
  score: {
    ...type.title,
    color: color.cardInk,
  },
  primary: {
    alignSelf: 'stretch',
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: color.linkFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.sm,
  },
  primaryPressed: {
    backgroundColor: color.linkDeep,
  },
  primaryText: {
    ...type.body,
    fontWeight: '700',
    color: color.white,
  },
  tertiary: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  tertiaryText: {
    ...type.body,
    color: color.cardMuted,
    textDecorationLine: 'underline',
  },
});
