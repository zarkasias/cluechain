import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Eye } from 'lucide-react-native';
import { answerLetters } from '@/lib/game';
import type { Link, LinkState } from '@/lib/game';
import { useReduceMotion } from '@/context/GameContext';
import { color, radius, space } from '@/constants/theme';

type SlotLink = Pick<LinkState, 'solved' | 'revealed'>;

type ChainTrackProps = {
  chain: { links: readonly Link[] };
  links: readonly SlotLink[];
  /** Index of the current link, or -1 when the chain is complete. */
  currentIndex: number;
  /** Total slots to draw. Slots past `chain.links` are placeholders showing "?" (the tutorial's 2-link chain). */
  slots?: number;
};

type SlotState = 'solved' | 'revealed' | 'current' | 'future';

function slotState(link: SlotLink | undefined, index: number, currentIndex: number): SlotState {
  if (link?.solved) return link.revealed ? 'revealed' : 'solved';
  return index === currentIndex ? 'current' : 'future';
}

function CurrentGlow() {
  const reduceMotion = useReduceMotion();
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

export type Rect = { x: number; y: number; width: number; height: number };

export type ChainTrackHandle = {
  /** Scroll so slot `index` is centred (immediately when `animated` is false). */
  scrollToSlot: (index: number, animated: boolean) => void;
  /** The slot's rectangle in window coordinates. */
  measureSlot: (index: number) => Promise<Rect | null>;
};

/** The bar between two slots. It fills left to right when the slot on its left is solved. */
function Connector({ filled }: { filled: boolean }) {
  const reduceMotion = useReduceMotion();
  const width = useSharedValue(filled ? CONNECTOR_WIDTH : 0);

  useEffect(() => {
    const target = filled ? CONNECTOR_WIDTH : 0;
    width.value = reduceMotion || !filled ? target : withTiming(target, { duration: 150 });
  }, [filled, reduceMotion, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: width.value }));
  return (
    <View style={styles.connector}>
      <Animated.View style={[styles.connectorFill, fillStyle]} />
    </View>
  );
}

const ChainTrack = forwardRef<ChainTrackHandle, ChainTrackProps>(function ChainTrack(
  { chain, links, currentIndex, slots = chain.links.length },
  ref,
) {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const slotRefs = useRef<(React.ComponentRef<typeof View> | null)[]>([]);
  const slotX = useRef<number[]>([]);
  const slotW = useRef<number[]>([]);
  const viewportWidth = useRef(0);

  const scrollToSlot = (index: number, animated: boolean) => {
    const x = slotX.current[index];
    const w = slotW.current[index] ?? 0;
    if (x === undefined) return;
    scrollRef.current?.scrollTo({ x: Math.max(0, x + w / 2 - viewportWidth.current / 2), animated });
  };

  /** Centre the current slot; when the chain is complete, show the end of the track. */
  const scrollToCurrent = () => {
    if (currentIndex < 0) scrollRef.current?.scrollToEnd({ animated: true });
    else scrollToSlot(currentIndex, true);
  };

  useImperativeHandle(ref, () => ({
    scrollToSlot,
    measureSlot: (index) =>
      new Promise((resolve) => {
        const node = slotRefs.current[index];
        if (!node) return resolve(null);
        node.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
      }),
  }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(scrollToCurrent, [currentIndex]);

  const solvedWords = chain.links.filter((_, i) => links[i]?.solved).map((l) => l.answer);
  const total = Math.max(slots, chain.links.length);
  const label =
    `Chain progress: ${solvedWords.length} of ${total} solved.` +
    (solvedWords.length ? ` ${solvedWords.map((w) => w[0].toUpperCase() + w.slice(1)).join(', ')}.` : '');

  return (
    <View accessible accessibilityLabel={label} onLayout={(e) => (viewportWidth.current = e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        importantForAccessibility="no-hide-descendants"
        // Slots change width as they fill; keep the end in view once the chain is complete.
        onContentSizeChange={() => currentIndex < 0 && scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {Array.from({ length: total }, (_, i) => {
          const link: Link | undefined = chain.links[i];
          const state = slotState(links[i], i, currentIndex);
          const word = link ? link.answer.toUpperCase() : '';
          const count = link ? answerLetters(link).length : '?';
          return (
            <View
              key={i}
              style={styles.slotWrap}
              onLayout={(e) => {
                // The wrapper holds [connector][slot]; record the slot's own x and width.
                const offset = i > 0 ? CONNECTOR_WIDTH : 0;
                slotX.current[i] = e.nativeEvent.layout.x + offset;
                slotW.current[i] = e.nativeEvent.layout.width - offset;
                if (i === currentIndex || (currentIndex < 0 && i === total - 1)) scrollToCurrent();
              }}
            >
              {i > 0 && <Connector filled={!!links[i - 1]?.solved} />}
              <View
                ref={(node) => {
                  slotRefs.current[i] = node;
                }}
                style={[styles.slot, slotStyles[state]]}
              >
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
});

export default ChainTrack;

const CONNECTOR_WIDTH = 14;
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
    width: CONNECTOR_WIDTH,
    height: 2,
    backgroundColor: color.slotEmpty,
  },
  connectorFill: {
    height: 2,
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
