import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, LayoutChangeEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChains, useGameDispatch, useGameState, useReduceMotion } from '@/context/GameContext';
import {
  answerLetters,
  canHint,
  chainResult,
  chainScore,
  clueText,
  currentChain,
  HINT_LETTER_PENALTY,
  isChainComplete,
  isReplay,
  LINKS_PER_CHAIN,
} from '@/lib/game';
import type { LinkState } from '@/lib/game';
import { haptics } from '@/lib/haptics';
import { color, layout, motion, space } from '@/constants/theme';
import PlayHeader from './play/PlayHeader';
import ChainTrack, { ChainTrackHandle, Rect } from './play/ChainTrack';
import ClueCard from './play/ClueCard';
import LetterTiles, { LetterTilesHandle, TileFill } from './play/LetterTiles';
import AnswerInput, { AnswerInputHandle, InputTone } from './play/AnswerInput';
import FeedbackLine, { Feedback } from './play/FeedbackLine';
import ActionBar from './play/ActionBar';
import ConfirmSheet from './play/ConfirmSheet';
import RecapView from './recap/RecapView';
import CarryOverLayer, { FLIGHT_MS, Ghost } from './play/CarryOverLayer';

/**
 * The carry-over (DESIGN_SPEC §3). The reducer has already advanced; this is
 * presentation only. Until `landed`, the track and score still show the link as
 * unsolved; until `swapped`, the card still shows the solved link's clue.
 */
type Transition = { index: number; mode: Exclude<TileFill, null>; landed: boolean; swapped: boolean };
type Sheet = 'reveal' | 'restart' | null;

/** Below this height (e.g. 360×740 with the keyboard up) the layout tightens. */
const COMPACT_HEIGHT = 600;
/** At or above this height the clue card grows to its minimum height. */
const TALL_HEIGHT = 700;
/** Tablets and desktop web: keep the input under the card instead of at the bottom. */
const WIDE_WIDTH = 600;

export default function GameScreen() {
  const state = useGameState();
  const chains = useChains();
  const dispatch = useGameDispatch();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { linkIndex, links, lastOutcome } = state;
  const chain = currentChain(chains, state);
  const complete = isChainComplete(state);

  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [tone, setTone] = useState<InputTone>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [transition, setTransition] = useState<Transition | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [height, setHeight] = useState(0);

  const [ghost, setGhost] = useState<Ghost | null>(null);
  const reduceMotion = useReduceMotion();

  const inputRef = useRef<AnswerInputHandle>(null);
  const rootRef = useRef<React.ComponentRef<typeof View>>(null);
  const trackRef = useRef<ChainTrackHandle>(null);
  const tilesRef = useRef<LetterTilesHandle>(null);
  const ghostId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const contentOpacity = useSharedValue(1);
  const cardOpacity = useSharedValue(1);
  const cardY = useSharedValue(0);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const transitionRef = useRef(transition);
  transitionRef.current = transition;
  const busy = transition !== null;
  const shownIndex = transition && !transition.swapped ? transition.index : linkIndex;
  const showCompletion = complete && !transition;
  // Until the ghost lands, present the link being carried over as still unsolved.
  const presentLinks: LinkState[] =
    transition && !transition.landed
      ? links.map((l, i) => (i === transition.index ? { ...l, solved: false, revealed: false } : l))
      : links;
  const trackCurrent = transition && !transition.landed ? transition.index : complete ? -1 : linkIndex;
  const compact = height > 0 && height < COMPACT_HEIGHT;
  const tall = height >= TALL_HEIGHT;
  const wide = width >= WIDE_WIDTH;

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  /** Jump straight to the end state (used when the app is backgrounded mid-animation). */
  const endCarryOver = useCallback(() => {
    clearTimers();
    setGhost(null);
    setTransition(null);
    setAnswer('');
    setTone(null);
    contentOpacity.value = 1;
    cardOpacity.value = 1;
    cardY.value = 0;
  }, [contentOpacity, cardOpacity, cardY]);

  /** Measure the tiles and the target slot, then launch the ghost chip (§3 step 2). */
  const launchGhost = async (index: number, word: string, revealed: boolean) => {
    const measureRoot = new Promise<Rect | null>((resolve) => {
      const node = rootRef.current;
      if (!node) return resolve(null);
      node.measureInWindow((x, y, w, h) => resolve({ x, y, width: w, height: h }));
    });
    const [root, from, to] = await Promise.all([
      measureRoot,
      tilesRef.current?.measure() ?? null,
      trackRef.current?.measureSlot(index) ?? null,
    ]);
    if (!root || !from || !to) return; // can't measure: skip the flight, the rest still runs
    setGhost({
      id: ++ghostId.current,
      word,
      revealed,
      from: { x: from.x - root.x + from.width / 2, y: from.y - root.y + from.height / 2 },
      to: { x: to.x - root.x + to.width / 2, y: to.y - root.y + to.height / 2 },
    });
  };

  /**
   * §3 timeline. Correct: tiles fill (0) → ghost flies (350) → slot fills, +N (750)
   * → card crossfades (750) → input clears and focuses (950). A reveal first fills
   * the tiles at 60 ms per letter. Link 5 lands, holds 400 ms, then shows completion.
   */
  const startCarryOver = (index: number, mode: Transition['mode']) => {
    if (!chain) return;
    const link = chain.links[index];
    const letters = answerLetters(link).length;
    const isLast = index === LINKS_PER_CHAIN - 1;
    clearTimers();
    setTransition({ index, mode, landed: false, swapped: false });

    const fillMs = mode === 'revealed' && !reduceMotion ? letters * 60 : 0;
    const flyAt = mode === 'correct' ? 350 : fillMs + 150;
    const landAt = reduceMotion ? flyAt : flyAt + FLIGHT_MS;
    const fade = reduceMotion ? motion.fast : 150;
    const fadeIn = reduceMotion ? motion.fast : 200;

    if (!reduceMotion) {
      // Bring the target slot into view before measuring it.
      later(() => trackRef.current?.scrollToSlot(index, false), flyAt - 60);
      later(() => void launchGhost(index, link.answer, mode === 'revealed'), flyAt);
    }

    later(() => {
      setGhost(null);
      setTransition((t) => (t ? { ...t, landed: true } : t));
    }, landAt);

    if (isLast) {
      later(() => (contentOpacity.value = withTiming(0, { duration: fade })), landAt + 400);
      later(() => {
        setTransition(null);
        contentOpacity.value = withTiming(1, { duration: fadeIn });
      }, landAt + 400 + fade);
      return;
    }

    later(() => (cardOpacity.value = withTiming(0, { duration: fade })), landAt);
    later(() => {
      setTransition((t) => (t ? { ...t, swapped: true } : t));
      cardY.value = reduceMotion ? 0 : 12;
      cardOpacity.value = withTiming(1, { duration: fadeIn });
      cardY.value = withTiming(0, { duration: fadeIn });
    }, landAt + fade);
    later(() => {
      setAnswer('');
      setTone(null);
      focusInput();
    }, landAt + 200);
    later(() => setTransition(null), landAt + fade + fadeIn);
  };

  // If the app is backgrounded mid-animation, jump to the end state.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active' && transitionRef.current) endCarryOver();
    });
    return () => sub.remove();
  }, [endCarryOver]);

  // React to the reducer's verdict. Layout effect so the next link never flashes before the hold.
  useLayoutEffect(() => {
    if (!chain || lastOutcome === null) return;
    if (lastOutcome === 'correct') {
      const index = complete ? linkIndex : linkIndex - 1;
      const solved = chain.links[index];
      setFeedback({ kind: 'correct', word: solved.answer });
      setTone('correct');
      haptics.success();
      dispatch({ type: 'CLEAR_FEEDBACK' });
      startCarryOver(index, 'correct');
    } else if (lastOutcome === 'wrong') {
      setFeedback({ kind: 'wrong', variant: links[linkIndex].wrongGuesses - 1 });
      setTone('wrong');
      setShakeKey((k) => k + 1);
      haptics.error();
    } else if (lastOutcome === 'near') {
      setFeedback({ kind: 'near' });
      setTone('near');
      haptics.light();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastOutcome]);

  // Announce each new link to screen readers, and focus the input on every platform.
  useEffect(() => {
    if (!chain || busy || complete) return;
    AccessibilityInfo.announceForAccessibility(
      `Link ${linkIndex + 1} of 5. ${clueText(chain.links[linkIndex].clue)}`,
    );
    const t = setTimeout(focusInput, 50);
    return () => clearTimeout(t);
  }, [chain, linkIndex, busy, complete, focusInput]);

  const clearFeedback = () => {
    setFeedback(null);
    setTone(null);
    if (lastOutcome === 'wrong' || lastOutcome === 'near') dispatch({ type: 'CLEAR_FEEDBACK' });
  };

  const handleChangeText = (text: string) => {
    setAnswer(text);
    if (feedback || tone) clearFeedback();
  };

  const handleSubmit = () => {
    // A wrong guess must be edited before it can be judged again (no double penalty).
    if (busy || answer.trim() === '' || lastOutcome !== null) return;
    dispatch({ type: 'SUBMIT_GUESS', guess: answer });
  };

  const handleHint = () => {
    if (busy || !canHint(chains, state)) return;
    dispatch({ type: 'HINT' });
    setFeedback({ kind: 'hint', cost: HINT_LETTER_PENALTY });
    setTone(null);
    haptics.selection();
  };

  const confirmReveal = () => {
    setSheet(null);
    if (!chain || busy || complete) return;
    setFeedback(null);
    setTone(null);
    dispatch({ type: 'REVEAL' });
    startCarryOver(linkIndex, 'revealed');
  };

  const confirmRestart = () => {
    setSheet(null);
    endCarryOver();
    clearFeedback();
    dispatch({ type: 'RESTART' });
  };

  const goNext = () => {
    setAnswer('');
    clearFeedback();
    dispatch({ type: 'NEXT_CHAIN' });
  };

  const replay = () => {
    setAnswer('');
    clearFeedback();
    if (chain) dispatch({ type: 'REPLAY_CHAIN', id: chain.id });
  };

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));
  const onLayout = (e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height);
  const gap = compact ? space.sm : space.lg;

  const untouched = linkIndex === 0 && links[0].hintLetters === 0 && links[0].wrongGuesses === 0 && !links[0].solved;
  const result = chainResult(state);

  if (!chain) {
    return <RecapView kind="all" />;
  }

  if (showCompletion && result && state.completion) {
    return (
      <Animated.View style={[styles.grow, contentStyle]}>
        <RecapView
          kind="chain"
          chain={chain}
          chainNumber={chains.indexOf(chain) + 1}
          result={result}
          completion={state.completion}
          onNext={goNext}
          onReplay={replay}
        />
      </Animated.View>
    );
  }

  return (
    <View ref={rootRef} style={[styles.root, { paddingTop: insets.top + space.sm }]} onLayout={onLayout}>
      <Animated.View style={[styles.column, { gap }, contentStyle]}>
        <PlayHeader
          chainNumber={chains.indexOf(chain) + 1}
          totalChains={chains.length}
          difficulty={chain.difficulty}
          title={chain.title}
          score={chainScore(presentLinks)}
          replay={isReplay(state)}
          compact={compact}
        />
        <ChainTrack ref={trackRef} chain={chain} links={presentLinks} currentIndex={trackCurrent} />

        <View style={[styles.grow, { gap }]}>
          <Animated.View style={[cardStyle, tall ? (wide ? styles.cardTall : [styles.cardTall, styles.cardGrow]) : null]}>
            <ClueCard
              key={`${chain.id}-${shownIndex}`}
              link={chain.links[shownIndex]}
              linkIndex={shownIndex}
              compact={compact}
              style={tall ? styles.grow : null}
            >
              <LetterTiles
                ref={tilesRef}
                link={chain.links[shownIndex]}
                hintLetters={links[shownIndex].hintLetters}
                fill={transition && !transition.swapped ? transition.mode : null}
                maxSize={compact ? 36 : 44}
              />
            </ClueCard>
          </Animated.View>

          <View style={wide ? null : styles.spacer} />

          <View style={[styles.bottom, { gap: compact ? space.xs : space.sm }]}>
            <FeedbackLine feedback={feedback} />
            <AnswerInput
              ref={inputRef}
              value={answer}
              onChangeText={handleChangeText}
              onSubmit={handleSubmit}
              tone={tone}
              shakeKey={shakeKey}
              disabled={busy}
            />
            <ActionBar
              hintCost={HINT_LETTER_PENALTY}
              canHint={canHint(chains, state)}
              showRestart={!untouched}
              disabled={busy}
              onHint={handleHint}
              onReveal={() => setSheet('reveal')}
              onRestart={() => setSheet('restart')}
            />
          </View>
        </View>
      </Animated.View>

      <ConfirmSheet
        visible={sheet === 'reveal'}
        title="Reveal this word?"
        message="You'll score 0 for this link."
        confirmLabel="Reveal"
        onConfirm={confirmReveal}
        onCancel={() => setSheet(null)}
      />
      <ConfirmSheet
        visible={sheet === 'restart'}
        title="Restart this chain?"
        message="Your progress on it will be lost."
        confirmLabel="Restart"
        onConfirm={confirmRestart}
        onCancel={() => setSheet(null)}
      />
      <CarryOverLayer ghost={ghost} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.bg,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
    paddingBottom: space.sm,
  },
  grow: {
    flex: 1,
  },
  cardTall: {
    minHeight: 220,
  },
  cardGrow: {
    flexGrow: 1,
    maxHeight: 320,
  },
  spacer: {
    flex: 1,
    minHeight: 0,
  },
  bottom: {},
});
