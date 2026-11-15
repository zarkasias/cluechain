import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { useReduceMotion } from '@/context/GameContext';
import { color, layout, motion, radius, space, type } from '@/constants/theme';
import type { Rect } from '@/components/play/ChainTrack';

export type { Rect };

type CoachMarkProps = {
  /** 1-based step, for the dots and to re-run the fade-in. */
  step: number;
  totalSteps: number;
  title: string;
  body: string;
  /** Cut out of the dim and ringed in pink. Coordinates are relative to the overlay. */
  highlights: Rect[];
  /** Cut out of the dim without a ring (e.g. the input the player types into). */
  clear?: Rect[];
  /** The bubble sits below this rect if it fits, otherwise above it; centred when omitted. */
  anchor?: Rect;
  /** When false, touches pass through the dim to the UI underneath. */
  blocking: boolean;
  action?: { label: string; onPress: () => void };
  onSkip: () => void;
};

const PAD = 6;
const GAP = space.md;

/** A rounded-rectangle sub-path, padded by PAD. */
function roundRect({ x, y, width, height }: Rect, r = radius.lg): string {
  const l = x - PAD;
  const t = y - PAD;
  const w = width + PAD * 2;
  const h = height + PAD * 2;
  const rr = Math.min(r, w / 2, h / 2);
  return (
    `M${l + rr} ${t} H${l + w - rr} A${rr} ${rr} 0 0 1 ${l + w} ${t + rr} ` +
    `V${t + h - rr} A${rr} ${rr} 0 0 1 ${l + w - rr} ${t + h} ` +
    `H${l + rr} A${rr} ${rr} 0 0 1 ${l} ${t + h - rr} V${t + rr} A${rr} ${rr} 0 0 1 ${l + rr} ${t} Z`
  );
}

/** True when `inner` lies entirely within `outer`. */
function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

/**
 * Where the bubble goes: below the anchor if it fits above the next cut-out (or
 * the bottom), otherwise above the anchor, otherwise just under the Skip link.
 */
function bubbleTop(anchor: Rect | undefined, holes: Rect[], size: { w: number; h: number }, bubbleH: number, minTop: number) {
  if (!anchor) return Math.max(minTop, (size.h - bubbleH) / 2);
  const anchorBottom = anchor.y + anchor.height + PAD;
  const below = holes
    .map((r) => r.y - PAD)
    .filter((y) => y >= anchorBottom)
    .reduce((a, b) => Math.min(a, b), size.h);
  if (anchorBottom + GAP + bubbleH <= below - GAP) {
    // Centre it in the free space so it doesn't hug the card.
    return anchorBottom + Math.max(GAP, (below - anchorBottom - bubbleH) / 2);
  }
  const above = anchor.y - PAD - GAP - bubbleH;
  if (above >= minTop) return above;
  return minTop;
}

/** A dimmed overlay with cut-outs, a speech bubble, step dots and a Skip link (DESIGN_SPEC §5). */
export default function CoachMark({
  step,
  totalSteps,
  title,
  body,
  highlights,
  clear = [],
  anchor,
  blocking,
  action,
  onSkip,
}: CoachMarkProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [bubbleH, setBubbleH] = useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  const holes = [...highlights, ...clear];
  // With the even-odd rule a hole inside another hole would be filled again, so drop nested ones.
  const outer = holes.filter((r, i) => !holes.some((o, j) => j !== i && contains(o, r) && !(contains(r, o) && j > i)));
  const d = `M0 0 H${size.w} V${size.h} H0 Z ` + outer.map((r) => roundRect(r)).join(' ');
  const skipBottom = insets.top + space.sm + 44;
  const top = bubbleTop(anchor, holes, size, bubbleH, skipBottom + space.sm);
  const fade = FadeIn.duration(reduceMotion ? motion.fast : motion.base);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" onLayout={onLayout}>
      {/* The dim. It swallows touches only when `blocking`. */}
      <View style={StyleSheet.absoluteFill} pointerEvents={blocking ? 'auto' : 'none'}>
        {size.w > 0 && (
          <Svg width={size.w} height={size.h} importantForAccessibility="no-hide-descendants">
            <Path d={d} fill={color.scrimStrong} fillRule="evenodd" />
          </Svg>
        )}
      </View>

      {highlights.map((r, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[
            styles.ring,
            { left: r.x - PAD, top: r.y - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 },
          ]}
        />
      ))}

      {size.h > 0 && (
        <Animated.View
          key={step}
          entering={fade}
          style={[styles.bubbleWrap, { top, opacity: bubbleH ? 1 : 0 }]}
          // Without a button, let touches through to the UI under the bubble.
          pointerEvents={action ? 'box-none' : 'none'}
        >
          <View
            style={styles.bubble}
            onLayout={(e) => setBubbleH(e.nativeEvent.layout.height)}
            accessible={!action}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`Step ${step} of ${totalSteps}. ${title} ${body}`}
          >
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Text style={styles.body}>{body}</Text>
            <View style={styles.footer}>
              <View style={styles.dots} importantForAccessibility="no-hide-descendants" aria-hidden>
                {Array.from({ length: totalSteps }, (_, i) => (
                  <View key={i} style={[styles.dot, i + 1 === step && styles.dotActive]} />
                ))}
              </View>
              {action && (
                <Pressable
                  style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
                  onPress={action.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                >
                  <Text style={styles.actionText}>{action.label}</Text>
                  <ArrowRight size={18} color={color.white} />
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>
      )}

      <Pressable
        style={[styles.skip, { top: insets.top + space.sm }]}
        onPress={onSkip}
        accessibilityRole="button"
        accessibilityLabel="Skip the tutorial"
        hitSlop={8}
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderRadius: radius.lg + PAD,
    borderWidth: 2,
    borderColor: color.link,
    shadowColor: color.link,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  bubbleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: layout.gutter,
    alignItems: 'center',
  },
  bubble: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: color.card,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.xs,
    shadowColor: color.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  title: {
    ...type.title,
    fontSize: 20,
    lineHeight: 26,
    color: color.cardInk,
  },
  body: {
    ...type.body,
    color: color.cardMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.sm,
    minHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.tileBorder,
  },
  dotActive: {
    width: 20,
    backgroundColor: color.linkFill,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: color.linkFill,
  },
  actionPressed: {
    backgroundColor: color.linkDeep,
  },
  actionText: {
    ...type.body,
    fontWeight: '700',
    color: color.white,
  },
  skip: {
    position: 'absolute',
    right: layout.gutter,
    minHeight: 44,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  skipText: {
    ...type.body,
    fontWeight: '700',
    color: color.ink,
    textDecorationLine: 'underline',
  },
});
