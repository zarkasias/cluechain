import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AccessibilityInfo, LayoutChangeEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChains, useGameDispatch, useGameState } from '@/context/GameContext';
import {
  answerLetters,
  canHint,
  chainResult,
  chainScore,
  clueText,
  currentChain,
  HINT_LETTER_PENALTY,
  isChainComplete,
} from '@/lib/game';
import { haptics } from '@/lib/haptics';
import { color, layout, motion, space } from '@/constants/theme';
import PlayHeader from './play/PlayHeader';
import ChainTrack from './play/ChainTrack';
import ClueCard from './play/ClueCard';
import LetterTiles, { TileFill } from './play/LetterTiles';
import AnswerInput, { AnswerInputHandle, InputTone } from './play/AnswerInput';
import FeedbackLine, { Feedback } from './play/FeedbackLine';
import ActionBar from './play/ActionBar';
import ConfirmSheet from './play/ConfirmSheet';
import CompletionCard from './play/CompletionCard';

/** A solved or revealed link that stays on screen while its tiles fill, before moving on. */
type Transition = { index: number; mode: Exclude<TileFill, null> };
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

  const inputRef = useRef<AnswerInputHandle>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const contentOpacity = useSharedValue(1);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const busy = transition !== null;
  const shownIndex = transition?.index ?? linkIndex;
  const showCompletion = complete && !transition;
  const compact = height > 0 && height < COMPACT_HEIGHT;
  const tall = height >= TALL_HEIGHT;
  const wide = width >= WIDE_WIDTH;

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  /** Hold the finished link for `holdMs`, then crossfade (150 ms) to whatever comes next. */
  const finishTransition = (holdMs: number) => {
    later(() => {
      contentOpacity.value = withTiming(0, { duration: motion.fast });
      later(() => {
        setTransition(null);
        setAnswer('');
        setTone(null);
        contentOpacity.value = withTiming(1, { duration: motion.fast });
        focusInput();
      }, motion.fast);
    }, holdMs);
  };

  // React to the reducer's verdict. Layout effect so the next link never flashes before the hold.
  useLayoutEffect(() => {
    if (!chain || lastOutcome === null) return;
    if (lastOutcome === 'correct') {
      const index = complete ? linkIndex : linkIndex - 1;
      const solved = chain.links[index];
      setTransition({ index, mode: 'correct' });
      setFeedback({ kind: 'correct', word: solved.answer });
      setTone('correct');
      haptics.success();
      dispatch({ type: 'CLEAR_FEEDBACK' });
      finishTransition(answerLetters(solved).length * 30 + 450);
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
    setTransition({ index: linkIndex, mode: 'revealed' });
    setFeedback(null);
    setTone(null);
    dispatch({ type: 'REVEAL' });
    finishTransition(answerLetters(chain.links[linkIndex]).length * 60 + 400);
  };

  const confirmRestart = () => {
    setSheet(null);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTransition(null);
    setAnswer('');
    clearFeedback();
    contentOpacity.value = 1;
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
    else if (chains[0]) dispatch({ type: 'REPLAY_CHAIN', id: chains[0].id });
  };

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));
  const onLayout = (e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height);
  const gap = compact ? space.sm : space.lg;

  const untouched = linkIndex === 0 && links[0].hintLetters === 0 && links[0].wrongGuesses === 0 && !links[0].solved;
  const result = chainResult(state);

  return (
    <View style={[styles.root, { paddingTop: insets.top + space.sm }]} onLayout={onLayout}>
      <View style={[styles.column, { gap }]}>
        {!chain ? (
          <CompletionCard kind="all" onPlayFirst={replay} />
        ) : (
          <>
            <PlayHeader
              chainNumber={chains.indexOf(chain) + 1}
              totalChains={chains.length}
              difficulty={chain.difficulty}
              title={chain.title}
              score={chainScore(links)}
              compact={compact}
            />
            <ChainTrack chain={chain} links={links} currentIndex={complete ? -1 : linkIndex} />

            <Animated.View style={[contentStyle, showCompletion ? null : styles.grow]}>
              {showCompletion && result ? (
                <CompletionCard kind="chain" title={chain.title} result={result} onNext={goNext} onReplay={replay} />
              ) : (
                <View style={[styles.grow, { gap }]}>
                  <ClueCard
                    key={`${chain.id}-${shownIndex}`}
                    link={chain.links[shownIndex]}
                    linkIndex={shownIndex}
                    compact={compact}
                    style={tall ? (wide ? styles.cardTall : [styles.cardTall, styles.cardGrow]) : null}
                  >
                    <LetterTiles
                      link={chain.links[shownIndex]}
                      hintLetters={links[shownIndex].hintLetters}
                      fill={transition?.mode ?? null}
                      maxSize={compact ? 36 : 44}
                    />
                  </ClueCard>

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
              )}
            </Animated.View>
          </>
        )}
      </View>

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
