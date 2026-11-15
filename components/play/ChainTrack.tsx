import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Eye } from 'lucide-react-native';
import { answerLetters } from '@/lib/game';
import type { Chain, LinkState } from '@/lib/game';
import { color, radius, space } from '@/constants/theme';

type ChainTrackProps = {
  chain: Chain;
  links: LinkState[];
  /** Index of the current link, or -1 when the chain is complete. */
  currentIndex: number;
};

type SlotState = 'solved' | 'revealed' | 'current' | 'future';

function slotState(link: LinkState, index: number, currentIndex: number): SlotState {
  if (link.solved) return link.revealed ? 'revealed' : 'solved';
  return index === currentIndex ? 'current' : 'future';
}

function CurrentGlow() {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = 0.6;
    opacity.value = withRepeat(withTiming(1, { duration: 750, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glow, style]} />;
}

export default function ChainTrack({ chain, links, currentIndex }: ChainTrackProps) {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const slotX = useRef<number[]>([]);
  const viewportWidth = useRef(0);

  const slotW = useRef<number[]>([]);

  /** Centre the current slot; when the chain is complete, show the end of the track. */
  const scrollToCurrent = () => {
    if (currentIndex < 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
      return;
    }
    const x = slotX.current[currentIndex];
    const w = slotW.current[currentIndex] ?? 0;
    if (x === undefined) return;
    scrollRef.current?.scrollTo({ x: Math.max(0, x + w / 2 - viewportWidth.current / 2), animated: true });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(scrollToCurrent, [currentIndex]);

  const solvedWords = chain.links.filter((_, i) => links[i]?.solved).map((l) => l.answer);
  const label =
    `Chain progress: ${solvedWords.length} of ${links.length} solved.` +
    (solvedWords.length ? ` ${solvedWords.map((w) => w[0].toUpperCase() + w.slice(1)).join(', ')}.` : '');

  return (
    <View accessible accessibilityLabel={label} onLayout={(e) => (viewportWidth.current = e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        importantForAccessibility="no-hide-descendants"
      >
        {chain.links.map((link, i) => {
          const state = slotState(links[i], i, currentIndex);
          const word = link.answer.toUpperCase();
          const count = answerLetters(link).length;
          return (
            <View
              key={i}
              style={styles.slotWrap}
              onLayout={(e) => {
                slotX.current[i] = e.nativeEvent.layout.x;
                slotW.current[i] = e.nativeEvent.layout.width;
                if (i === currentIndex || (currentIndex < 0 && i === links.length - 1)) scrollToCurrent();
              }}
            >
              {i > 0 && (
                <View style={[styles.connector, links[i - 1]?.solved && styles.connectorFilled]} />
              )}
              <View style={[styles.slot, slotStyles[state]]}>
                {state === 'current' && <CurrentGlow />}
                {state === 'solved' && (
                  <Text style={styles.word} maxFontSizeMultiplier={1.3}>
                    {word}
                  </Text>
                )}
                {state === 'revealed' && (
                  <>
                    <Eye size={14} color={color.inkMuted} />
                    <Text style={[styles.word, styles.wordRevealed]} maxFontSizeMultiplier={1.3}>
                      {word}
                    </Text>
                  </>
                )}
                {(state === 'current' || state === 'future') && (
                  <Text
                    style={[styles.count, state === 'current' && styles.countCurrent]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {count}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const SLOT_HEIGHT = 44;

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  slotWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connector: {
    width: 14,
    height: 2,
    backgroundColor: color.slotEmpty,
  },
  connectorFilled: {
    backgroundColor: color.link,
  },
  slot: {
    minHeight: SLOT_HEIGHT,
    minWidth: SLOT_HEIGHT,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  glow: {
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: color.link,
    shadowColor: color.link,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  word: {
    fontFamily: 'Play-Bold',
    fontSize: 14,
    color: color.white,
    letterSpacing: 0.5,
  },
  wordRevealed: {
    color: color.inkMuted,
  },
  count: {
    fontFamily: 'Play-Bold',
    fontSize: 14,
    color: color.inkMuted,
  },
  countCurrent: {
    color: color.ink,
  },
});

const slotStyles = StyleSheet.create({
  solved: {
    backgroundColor: color.linkFill,
  },
  revealed: {
    borderWidth: 1.5,
    borderColor: color.inkMuted,
  },
  current: {
    backgroundColor: color.bg,
  },
  future: {
    backgroundColor: color.slotEmpty,
  },
});
