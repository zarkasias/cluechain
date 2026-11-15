import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight, Eye, Flame, Lightbulb, Link, Play, Star, Timer, Trophy } from 'lucide-react-native';
import { useChains, useGameDispatch, useGameState } from '@/context/GameContext';
import { averageTimeMs, chainInProgress, displayStreak, historyRows, localDayISO } from '@/lib/game';
import type { Difficulty, HistoryRow, Stars } from '@/lib/game';
import { formatDuration } from '@/lib/format';
import { color, layout, radius, space, type } from '@/constants/theme';
import ConfirmSheet from '@/components/play/ConfirmSheet';

const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

function HeroTile({ Icon, tint, value, label, caption }: { Icon: LucideIcon; tint: string; value: string; label: string; caption?: string }) {
  return (
    <View style={styles.hero} accessible accessibilityLabel={`${label}: ${value}${caption ? `. ${caption}` : ''}`}>
      <Icon size={22} color={tint} fill={tint === color.gold ? tint : 'transparent'} />
      <Text style={styles.heroValue} maxFontSizeMultiplier={1.4} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.heroLabel} maxFontSizeMultiplier={1.4} numberOfLines={1}>
        {label}
      </Text>
      {caption !== undefined && (
        <Text style={styles.heroCaption} maxFontSizeMultiplier={1.4} numberOfLines={1}>
          {caption}
        </Text>
      )}
    </View>
  );
}

function StatCard({ Icon, value, label }: { Icon: LucideIcon; value: string; label: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value === '—' ? 'none yet' : value}`}>
      <View style={styles.statIcon}>
        <Icon size={18} color={color.linkDeep} />
      </View>
      <View style={styles.statText}>
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function StarRow({ stars }: { stars: Stars }) {
  return (
    <View style={styles.starRow}>
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          size={14}
          color={i < stars ? color.gold : color.cardMuted}
          fill={i < stars ? color.gold : 'transparent'}
          strokeWidth={1.5}
        />
      ))}
    </View>
  );
}

function HistoryItem({ row, onPress }: { row: HistoryRow; onPress: () => void }) {
  const { chain, number, entry } = row;
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        `Chain ${number}, ${chain.title}, ${DIFFICULTY_LABEL[chain.difficulty]}. ${entry.stars} of 3 stars. ` +
        `Best score ${entry.bestScore}, best time ${formatDuration(entry.bestTimeMs)}.`
      }
      accessibilityHint="Offers to replay this chain"
    >
      <View style={styles.rowMain}>
        <View style={styles.rowTitleLine}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {chain.title}
          </Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{DIFFICULTY_LABEL[chain.difficulty]}</Text>
          </View>
        </View>
        <View style={styles.rowMeta}>
          <StarRow stars={entry.stars} />
          <Text style={styles.rowMetaText}>
            {entry.bestScore} pts · {formatDuration(entry.bestTimeMs)}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={color.cardMuted} />
    </Pressable>
  );
}

export default function StatsScreen() {
  const state = useGameState();
  const chains = useChains();
  const dispatch = useGameDispatch();
  const insets = useSafeAreaInsets();
  const [replaying, setReplaying] = useState<HistoryRow | null>(null);
  // Today, refreshed whenever the tab is shown (the streak depends on it).
  const [today, setToday] = useState(() => localDayISO(Date.now()));
  useFocusEffect(useCallback(() => setToday(localDayISO(Date.now())), []));

  const { stats, history } = state;
  const rows = historyRows(chains, history);
  const empty = stats.chainsCompleted === 0 && rows.length === 0;
  const streak = displayStreak(stats, today);
  const average = averageTimeMs(stats);
  const playing = chainInProgress(chains, state);

  const goPlay = () => router.navigate('/(tabs)');

  const confirmReplay = () => {
    if (replaying) dispatch({ type: 'REPLAY_CHAIN', id: replaying.chain.id });
    setReplaying(null);
    goPlay();
  };

  // Replaying discards an unfinished chain, so say so when there is one (and it's a different chain).
  const lost = playing && replaying && playing.chain.id !== replaying.chain.id ? playing : null;
  const replayMessage =
    "Replays don't change your stats." +
    (lost ? ` Your progress on chain ${lost.chainNumber} (link ${lost.linkNumber} of 5) will be lost.` : '');

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <Text style={styles.display} accessibilityRole="header">
            Stats
          </Text>

          {empty ? (
            <View style={styles.empty}>
              <Trophy size={48} color={color.inkMuted} />
              <Text style={styles.emptyText}>No chains yet — your stats will appear here.</Text>
              <Pressable
                style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
                onPress={goPlay}
                accessibilityRole="button"
                accessibilityLabel="Play"
              >
                <Play size={18} color={color.white} fill={color.white} />
                <Text style={styles.primaryText}>Play</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.heroRow}>
                <HeroTile
                  Icon={Flame}
                  tint={color.linkDeep}
                  value={String(streak)}
                  label="Streak"
                  caption={`Best ${stats.bestStreak}`}
                />
                <HeroTile
                  Icon={Link}
                  tint={color.linkDeep}
                  value={`${stats.chainsCompleted}/${chains.length}`}
                  label="Chains"
                />
                <HeroTile Icon={Star} tint={color.gold} value={String(stats.perfectChains)} label="Perfect" />
              </View>

              <View style={styles.grid}>
                <StatCard Icon={Trophy} value={stats.totalPoints.toLocaleString()} label="Total points" />
                <StatCard
                  Icon={Timer}
                  value={stats.bestTimeMs === null ? '—' : formatDuration(stats.bestTimeMs)}
                  label="Best time"
                />
                <StatCard Icon={Timer} value={average === null ? '—' : formatDuration(average)} label="Average time" />
                <StatCard Icon={Link} value={stats.wordsSolved.toLocaleString()} label="Words solved" />
                <StatCard Icon={Lightbulb} value={stats.hintsUsed.toLocaleString()} label="Hints used" />
                <StatCard Icon={Eye} value={stats.wordsRevealed.toLocaleString()} label="Words revealed" />
              </View>

              <View style={styles.section}>
                <Text style={styles.heading} accessibilityRole="header">
                  History
                </Text>
                {rows.map((row) => (
                  <HistoryItem key={row.chain.id} row={row} onPress={() => setReplaying(row)} />
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <ConfirmSheet
        visible={replaying !== null}
        title={`Replay ${replaying?.chain.title ?? ''}?`}
        message={replayMessage}
        confirmLabel="Replay"
        onConfirm={confirmReplay}
        onCancel={() => setReplaying(null)}
      />
    </View>
  );
}

const GRID_GAP = space.md;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.bg,
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
  display: {
    ...type.display,
    color: color.ink,
  },
  heroRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  hero: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 2,
    paddingVertical: space.lg,
    paddingHorizontal: space.sm,
    borderRadius: radius.lg,
    backgroundColor: color.card,
  },
  heroValue: {
    fontFamily: 'Play-Bold',
    fontSize: 28,
    lineHeight: 34,
    color: color.cardInk,
    fontVariant: ['tabular-nums'],
    marginTop: space.xs,
  },
  heroLabel: {
    ...type.label,
    color: color.cardMuted,
  },
  heroCaption: {
    fontSize: 12,
    lineHeight: 16,
    color: color.cardMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  stat: {
    // Two columns: half the width minus half the gap.
    flexBasis: '46%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: color.card,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.linkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontFamily: 'Play-Bold',
    fontSize: 22,
    lineHeight: 28,
    color: color.cardInk,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: color.cardMuted,
  },
  section: {
    gap: space.md,
  },
  heading: {
    ...type.title,
    color: color.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 64,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    backgroundColor: color.card,
  },
  rowPressed: {
    backgroundColor: color.tile,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
    gap: space.xs,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  rowTitle: {
    ...type.body,
    fontWeight: '700',
    color: color.cardInk,
    flexShrink: 1,
  },
  chip: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: color.tile,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: color.cardMuted,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  rowMetaText: {
    fontSize: 14,
    lineHeight: 20,
    color: color.cardMuted,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.lg,
    paddingVertical: space.xxl,
  },
  emptyText: {
    ...type.body,
    color: color.ink,
    textAlign: 'center',
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    alignSelf: 'stretch',
    minHeight: 52,
    borderRadius: radius.md,
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
});
