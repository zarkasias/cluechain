import React, { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowRight, Share2, Star, Trophy } from 'lucide-react-native';
import type { Chain, ChainResult, Completion } from '@/lib/game';
import { formatDuration } from '@/lib/format';
import { buildShareText, shareText } from '@/lib/share';
import { haptics } from '@/lib/haptics';
import { color, layout, radius, space, type } from '@/constants/theme';
import Toast from '@/components/Toast';
import RecapStars from './RecapStars';
import RecapChain from './RecapChain';

type RecapViewProps =
  | {
      kind: 'chain';
      chain: Chain;
      chainNumber: number;
      result: ChainResult;
      completion: Completion;
      onNext: () => void;
      onReplay: () => void;
    }
  | { kind: 'all' };

const REPLAY_CAPTION = "Replays don't change your stats";

/** Show each link's clue beside its connector only when there's room (not at 360×740). */
const CLUES_MIN_HEIGHT = 780;
/** At this width the Share and Next buttons sit side by side. */
const WIDE_WIDTH = 600;

/** The recap (DESIGN_SPEC §4), shown in place of the Play content when a chain is complete. */
export default function RecapView(props: RecapViewProps) {
  const insets = useSafeAreaInsets();
  const [toastKey, setToastKey] = useState(0);
  const onCopied = useCallback(() => setToastKey((k) => k + 1), []);
  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          {props.kind === 'all' ? <AllComplete /> : <ChainRecap {...props} onCopied={onCopied} />}
        </View>
      </ScrollView>
      <Toast message="Copied!" showKey={toastKey} />
    </View>
  );
}

type ChainRecapProps = Extract<RecapViewProps, { kind: 'chain' }> & { onCopied: () => void };

function ChainRecap({ chain, chainNumber, result, completion, onNext, onReplay, onCopied }: ChainRecapProps) {
  const { width, height } = useWindowDimensions();
  const wide = width >= WIDE_WIDTH;
  const linkTotal = result.links.reduce((s, l) => s + l.value, 0);
  const bonus = result.score - linkTotal;

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      `Chain complete. ${result.stars} of 3 stars. ${result.score} points. Time ${formatDuration(result.timeMs)}.`,
    );
  }, [result]);

  const share = async () => {
    haptics.selection();
    const outcome = await shareText(buildShareText(chain, result, chainNumber));
    if (outcome === 'copied') onCopied();
  };

  const badges: string[] = [];
  if (completion.first) {
    if (completion.perfect) badges.push('Perfect chain!');
    if (completion.newBestTime) badges.push('New best time!');
  }
  const previous = completion.first ? null : completion.previous;

  const nextButton = (
    <Pressable
      key="next"
      style={({ pressed }) => [styles.button, styles.primary, wide && styles.buttonWide, pressed && styles.primaryPressed]}
      onPress={onNext}
      accessibilityRole="button"
      accessibilityLabel="Next chain"
    >
      <Text style={styles.primaryText}>Next chain</Text>
      <ArrowRight size={20} color={color.white} />
    </Pressable>
  );
  const shareButton = (
    <Pressable
      key="share"
      style={({ pressed }) => [styles.button, styles.secondary, wide && styles.buttonWide, pressed && styles.secondaryPressed]}
      onPress={share}
      accessibilityRole="button"
      accessibilityLabel="Share your result. Answers aren't included."
    >
      <Share2 size={18} color={color.ink} />
      <Text style={styles.secondaryText}>Share</Text>
    </Pressable>
  );

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.display} accessibilityRole="header">
          Chain complete!
        </Text>
        <Text style={styles.chainTitle}>{chain.title}</Text>
        <RecapStars stars={result.stars} />
        {badges.length > 0 && (
          <View style={styles.badges}>
            {badges.map((b) => (
              <Badge key={b} label={b} />
            ))}
          </View>
        )}
      </View>

      <RecapChain chain={chain} links={result.links} showClues={height >= CLUES_MIN_HEIGHT} />

      <View style={styles.breakdown}>
        <Row label="Links" value={String(linkTotal)} />
        <Row label="Perfect bonus" value={bonus > 0 ? `+${bonus}` : '—'} muted={bonus === 0} />
        <Row label="Time" value={formatDuration(result.timeMs)} />
        <View style={styles.divider} />
        <View style={styles.totalRow} accessible accessibilityLabel={`Score ${result.score} points`}>
          <Text style={styles.totalLabel}>Score</Text>
          <Text style={styles.totalValue}>{result.score}</Text>
        </View>
      </View>

      {previous && <PersonalBest result={result} previous={previous} />}

      <View style={[styles.buttons, wide && styles.buttonsWide]}>
        {/* Stacked, Next comes first; side by side, Share is on the left (as in the §4 sketch). */}
        {wide ? [shareButton, nextButton] : [nextButton, shareButton]}
      </View>

      <View style={styles.replay}>
        <Pressable
          style={styles.tertiary}
          onPress={onReplay}
          accessibilityRole="button"
          accessibilityLabel="Replay this chain. Replays don't change your stats."
          hitSlop={4}
        >
          <Text style={styles.tertiaryText}>Replay</Text>
        </Pressable>
        <Text style={styles.caption}>{REPLAY_CAPTION}</Text>
      </View>
    </>
  );
}

function PersonalBest({ result, previous }: { result: ChainResult; previous: NonNullable<Completion['previous']> }) {
  const newScore = result.score > previous.bestScore;
  const newTime = result.timeMs < previous.bestTimeMs;
  return (
    <View style={styles.best}>
      <Text style={styles.bestLabel} accessibilityRole="header">
        Personal best
      </Text>
      <Row
        label="Score"
        value={newScore ? `${previous.bestScore} → ${result.score}` : String(previous.bestScore)}
        tag={newScore ? 'New best!' : undefined}
        a11y={newScore ? `New best score: ${result.score}, up from ${previous.bestScore}` : `Best score ${previous.bestScore}`}
      />
      <Row
        label="Time"
        value={newTime ? `${formatDuration(previous.bestTimeMs)} → ${formatDuration(result.timeMs)}` : formatDuration(previous.bestTimeMs)}
        tag={newTime ? 'New best!' : undefined}
        a11y={
          newTime
            ? `New best time: ${formatDuration(result.timeMs)}, down from ${formatDuration(previous.bestTimeMs)}`
            : `Best time ${formatDuration(previous.bestTimeMs)}`
        }
      />
    </View>
  );
}

function AllComplete() {
  return (
    <View style={styles.all}>
      <Trophy size={56} color={color.gold} />
      <Text style={[styles.display, styles.center]} accessibilityRole="header">
        You finished every chain!
      </Text>
      <Text style={[styles.message, styles.center]}>New chains are coming soon.</Text>
      <Pressable
        style={({ pressed }) => [styles.button, styles.primary, styles.stretch, pressed && styles.primaryPressed]}
        onPress={() => router.navigate('/stats')}
        accessibilityRole="button"
        accessibilityLabel="See your history in Stats. You can replay any chain from there."
      >
        <Text style={styles.primaryText}>See your history</Text>
        <ArrowRight size={20} color={color.white} />
      </Pressable>
      <Text style={[styles.caption, styles.center]}>Replay any chain from your history.</Text>
    </View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Star size={14} color={color.gold} fill={color.gold} />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function Row({ label, value, muted, tag, a11y }: { label: string; value: string; muted?: boolean; tag?: string; a11y?: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={a11y ?? `${label} ${value === '—' ? 'none' : value}`}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {tag && <Badge label={tag} />}
        <Text style={[styles.rowValue, muted && styles.rowValueMuted]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.bgDeep,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.gutter,
    paddingBottom: space.xxl,
  },
  column: {
    flexGrow: 1,
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    gap: space.xl,
  },
  header: {
    alignItems: 'center',
    gap: space.sm,
  },
  display: {
    ...type.display,
    color: color.ink,
  },
  chainTitle: {
    ...type.title,
    color: color.inkMuted,
  },
  message: {
    ...type.body,
    color: color.inkMuted,
  },
  center: {
    textAlign: 'center',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: color.gold,
  },
  badgeText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: color.gold,
  },
  breakdown: {
    gap: space.xs,
  },
  best: {
    gap: space.xs,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: color.bg,
  },
  bestLabel: {
    ...type.label,
    color: color.inkMuted,
    marginBottom: space.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  rowLabel: {
    ...type.body,
    color: color.inkMuted,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  rowValue: {
    ...type.body,
    fontWeight: '600',
    color: color.ink,
    fontVariant: ['tabular-nums'],
  },
  rowValueMuted: {
    color: color.inkMuted,
  },
  divider: {
    height: 1,
    backgroundColor: color.slotEmpty,
    marginVertical: space.xs,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...type.title,
    color: color.ink,
  },
  totalValue: {
    ...type.display,
    color: color.gold,
    fontVariant: ['tabular-nums'],
  },
  buttons: {
    gap: space.md,
  },
  buttonsWide: {
    flexDirection: 'row',
  },
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
  },
  buttonWide: {
    flex: 1,
  },
  stretch: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: color.linkFill,
  },
  primaryPressed: {
    backgroundColor: color.linkDeep,
  },
  primaryText: {
    ...type.body,
    fontWeight: '700',
    color: color.white,
  },
  secondary: {
    borderWidth: 1.5,
    borderColor: color.link,
  },
  secondaryPressed: {
    backgroundColor: color.slotEmpty,
  },
  secondaryText: {
    ...type.body,
    fontWeight: '700',
    color: color.ink,
  },
  replay: {
    alignItems: 'center',
    marginTop: -space.md,
  },
  tertiary: {
    minHeight: 44,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  tertiaryText: {
    ...type.body,
    fontWeight: '600',
    color: color.ink,
    textDecorationLine: 'underline',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: color.inkMuted,
  },
  all: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.lg,
    paddingVertical: space.xxl,
  },
});
