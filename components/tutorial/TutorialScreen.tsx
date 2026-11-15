import React, { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { AccessibilityInfo, Keyboard, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameDispatch, useReduceMotion } from '@/context/GameContext';
import {
  answerLetters,
  clueText,
  createTutorialReducer,
  createTutorialState,
  HINT_LETTER_PENALTY,
  LINKS_PER_CHAIN,
  maxHintLetters,
  tutorialShowsAnswer,
} from '@/lib/game';
import { tutorialLinks } from '@/data/tutorial';
import { haptics } from '@/lib/haptics';
import { color, layout, motion, space, type } from '@/constants/theme';
import ChainTrack, { ChainTrackHandle, Rect } from '@/components/play/ChainTrack';
import ClueCard from '@/components/play/ClueCard';
import LetterTiles, { LetterTilesHandle, TileFill } from '@/components/play/LetterTiles';
import AnswerInput, { AnswerInputHandle, InputTone } from '@/components/play/AnswerInput';
import FeedbackLine, { Feedback } from '@/components/play/FeedbackLine';
import ActionBar from '@/components/play/ActionBar';
import CarryOverLayer, { FLIGHT_MS, Ghost } from '@/components/play/CarryOverLayer';
import CoachMark from './CoachMark';

const reducer = createTutorialReducer(tutorialLinks);
const TOTAL_STEPS = 3;

/** Presentation of a solve: tiles fill, the word flies to the track, then the card swaps. */
type Transition = { index: number; mode: Exclude<TileFill, null>; landed: boolean };
type Targets = { card?: Rect; chip?: Rect; bottom?: Rect; track?: Rect; actions?: Rect };
type MeasurableRef = React.RefObject<React.ComponentRef<typeof View> | null>;

const STEPS = {
  1: { title: 'Solve the clue', body: 'Read the clue, then type your answer below.' },
  2: { title: 'Your answer becomes the next clue', body: 'BANANA is part of this clue now. Solve it to grow the chain.' },
  3: {
    title: 'Build a chain of 5',
    body: `Stuck? Use a hint (−${HINT_LETTER_PENALTY} a letter) or reveal the word.`,
  },
} as const;

/**
 * The first-run tutorial (DESIGN_SPEC §5): the real Play components over a
 * 2-link demo chain, with coach marks. It never touches stats or history.
 */
export default function TutorialScreen() {
  const dispatchGame = useGameDispatch();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const [state, dispatch] = useReducer(reducer, tutorialLinks, createTutorialState);

  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [tone, setTone] = useState<InputTone>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [transition, setTransition] = useState<Transition | null>(null);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [targets, setTargets] = useState<Targets>({});

  const rootRef = useRef<React.ComponentRef<typeof View>>(null);
  const cardRef = useRef<React.ComponentRef<typeof View>>(null);
  const chipRef = useRef<React.ComponentRef<typeof View>>(null);
  const bottomRef = useRef<React.ComponentRef<typeof View>>(null);
  const trackWrapRef = useRef<React.ComponentRef<typeof View>>(null);
  const actionsRef = useRef<React.ComponentRef<typeof View>>(null);
  const trackRef = useRef<ChainTrackHandle>(null);
  const tilesRef = useRef<LetterTilesHandle>(null);
  const inputRef = useRef<AnswerInputHandle>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cardOpacity = useSharedValue(1);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const busy = transition !== null;
  const done = state.linkIndex >= tutorialLinks.length;
  // The card keeps showing the solved link until the swap.
  const shownIndex = transition ? transition.index : Math.min(state.linkIndex, tutorialLinks.length - 1);
  const step = done ? 3 : state.linkIndex === 0 ? 1 : 2;
  const presentLinks =
    transition && !transition.landed
      ? state.links.map((l, i) => (i === transition.index ? { ...l, solved: false, revealed: false } : l))
      : state.links;
  const trackCurrent = transition && !transition.landed ? transition.index : done ? -1 : state.linkIndex;
  const link = tutorialLinks[shownIndex];
  const linkState = state.links[shownIndex];

  // ---------- measuring the coach-mark targets ----------

  const measure = useCallback(async () => {
    const inWindow = (ref: MeasurableRef) =>
      new Promise<Rect | undefined>((resolve) => {
        const node = ref.current;
        if (!node) return resolve(undefined);
        node.measureInWindow((x, y, w, h) => resolve(w > 0 && h > 0 ? { x, y, width: w, height: h } : undefined));
      });
    const [root, card, chip, bottom, track, actions] = await Promise.all(
      [rootRef, cardRef, chipRef, bottomRef, trackWrapRef, actionsRef].map(inWindow),
    );
    if (!root) return;
    const rel = (r?: Rect) => r && { ...r, x: r.x - root.x, y: r.y - root.y };
    setTargets({ card: rel(card), chip: rel(chip), bottom: rel(bottom), track: rel(track), actions: rel(actions) });
  }, []);

  // Re-measure after anything that moves the layout: a new step, a resize, the keyboard.
  useEffect(() => {
    if (busy) return;
    const t = setTimeout(measure, 60);
    return () => clearTimeout(t);
  }, [busy, step, width, height, feedback, measure]);

  useEffect(() => {
    const subs = [
      Keyboard.addListener('keyboardDidShow', () => setTimeout(measure, 60)),
      Keyboard.addListener('keyboardDidHide', () => setTimeout(measure, 60)),
    ];
    return () => subs.forEach((s) => s.remove());
  }, [measure]);

  // ---------- the carry-over, simplified from GameScreen (§3) ----------

  const launchGhost = async (index: number, revealed: boolean) => {
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
    if (!root || !from || !to) return;
    setGhost({
      id: index + 1,
      word: tutorialLinks[index].answer,
      revealed,
      from: { x: from.x - root.x + from.width / 2, y: from.y - root.y + from.height / 2 },
      to: { x: to.x - root.x + to.width / 2, y: to.y - root.y + to.height / 2 },
    });
  };

  const startCarryOver = (index: number, mode: Transition['mode']) => {
    const letters = answerLetters(tutorialLinks[index]).length;
    const isLast = index === tutorialLinks.length - 1;
    setTransition({ index, mode, landed: false });
    Keyboard.dismiss();

    const fillMs = mode === 'revealed' && !reduceMotion ? letters * 60 : 0;
    const flyAt = mode === 'correct' ? 350 : fillMs + 150;
    const landAt = reduceMotion ? flyAt : flyAt + FLIGHT_MS;
    if (!reduceMotion) later(() => void launchGhost(index, mode === 'revealed'), flyAt);
    later(() => {
      setGhost(null);
      setTransition((t) => (t ? { ...t, landed: true } : t));
    }, landAt);

    if (isLast) {
      // Hold on the finished chain, then show step 3.
      later(() => {
        setTransition(null);
        setAnswer('');
        setFeedback(null);
        setTone(null);
      }, landAt + 400);
      return;
    }
    later(() => (cardOpacity.value = withTiming(0, { duration: motion.fast })), landAt);
    later(() => {
      setTransition(null);
      setAnswer('');
      setFeedback(null);
      setTone(null);
      cardOpacity.value = withTiming(1, { duration: 200 });
      inputRef.current?.focus();
    }, landAt + motion.fast);
  };

  // React to the tutorial reducer's verdict.
  useLayoutEffect(() => {
    const { lastOutcome } = state;
    if (lastOutcome === null) return;
    if (lastOutcome === 'correct') {
      const index = state.linkIndex - 1;
      setFeedback({ kind: 'correct', word: tutorialLinks[index].answer });
      setTone('correct');
      haptics.success();
      dispatch({ type: 'CLEAR_FEEDBACK' });
      startCarryOver(index, 'correct');
    } else if (lastOutcome === 'wrong') {
      const showsAnswer = tutorialShowsAnswer(link, linkState);
      setFeedback(showsAnswer ? { kind: 'answer' } : { kind: 'wrong', variant: linkState.wrongGuesses - 1 });
      setTone('wrong');
      setShakeKey((k) => k + 1);
      haptics.error();
    } else if (lastOutcome === 'near') {
      setFeedback({ kind: 'near' });
      setTone('near');
      haptics.light();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lastOutcome]);

  // Announce each step to screen readers.
  useEffect(() => {
    if (busy) return;
    const s = STEPS[step];
    const clue = done ? '' : ` Clue: ${clueText(tutorialLinks[state.linkIndex].clue)}`;
    AccessibilityInfo.announceForAccessibility(`Tutorial step ${step} of ${TOTAL_STEPS}. ${s.title}. ${s.body}${clue}`);
    if (!done) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [step, busy, done, state.linkIndex]);

  // ---------- input ----------

  const clearFeedback = () => {
    setFeedback(null);
    setTone(null);
    if (state.lastOutcome === 'wrong' || state.lastOutcome === 'near') dispatch({ type: 'CLEAR_FEEDBACK' });
  };

  const handleChangeText = (text: string) => {
    setAnswer(text);
    if (feedback?.kind === 'answer') {
      // Keep the "here's the answer" line until they get it.
      setTone(null);
      if (state.lastOutcome) dispatch({ type: 'CLEAR_FEEDBACK' });
    } else if (feedback || tone) {
      clearFeedback();
    }
  };

  const handleSubmit = () => {
    if (busy || done || answer.trim() === '' || state.lastOutcome !== null) return;
    dispatch({ type: 'SUBMIT_GUESS', guess: answer });
  };

  const canHint = !done && !busy && linkState.hintLetters < maxHintLetters(link);

  const handleHint = () => {
    if (!canHint || done) return;
    dispatch({ type: 'HINT' });
    setFeedback({ kind: 'hint', cost: HINT_LETTER_PENALTY });
    setTone(null);
    haptics.selection();
  };

  const handleReveal = () => {
    if (busy || done) return;
    const index = state.linkIndex;
    setFeedback(null);
    setTone(null);
    dispatch({ type: 'REVEAL' });
    startCarryOver(index, 'revealed');
  };

  const finish = () => {
    timers.current.forEach(clearTimeout);
    Keyboard.dismiss();
    dispatchGame({ type: 'COMPLETE_TUTORIAL' });
  };

  // ---------- coach mark for this step ----------

  let coach: React.ReactNode = null;
  if (!busy) {
    const s = STEPS[step];
    const common = { step, totalSteps: TOTAL_STEPS, title: s.title, body: s.body, onSkip: finish };
    if (step === 1 && targets.card) {
      coach = (
        <CoachMark {...common} highlights={[targets.card]} clear={targets.bottom ? [targets.bottom] : []} anchor={targets.card} blocking={false} />
      );
    } else if (step === 2 && targets.card) {
      coach = (
        <CoachMark
          {...common}
          highlights={targets.chip ? [targets.chip] : [targets.card]}
          clear={[targets.card, ...(targets.bottom ? [targets.bottom] : [])]}
          anchor={targets.card}
          blocking={false}
        />
      );
    } else if (step === 3 && targets.track && targets.actions) {
      coach = (
        <CoachMark
          {...common}
          highlights={[targets.track, targets.actions]}
          blocking
          action={{ label: "Let's play", onPress: finish }}
        />
      );
    }
  }

  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value }));

  return (
    <View ref={rootRef} style={[styles.root, { paddingTop: insets.top + space.sm }]} onLayout={() => setTimeout(measure, 60)}>
      <View style={styles.column}>
        <View style={styles.header}>
          <Text style={styles.meta} accessibilityRole="header">
            Tutorial
          </Text>
          <Text style={styles.title}>Learn the chain</Text>
        </View>

        <View ref={trackWrapRef} collapsable={false}>
          <ChainTrack
            ref={trackRef}
            chain={{ links: tutorialLinks }}
            links={presentLinks}
            currentIndex={trackCurrent}
            slots={LINKS_PER_CHAIN}
          />
        </View>

        <Animated.View style={cardStyle}>
          <View ref={cardRef} collapsable={false}>
            <ClueCard key={shownIndex} link={link} linkIndex={shownIndex} linkChipRef={chipRef}>
              <LetterTiles
                ref={tilesRef}
                link={link}
                hintLetters={linkState.hintLetters}
                fill={transition ? transition.mode : null}
              />
            </ClueCard>
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        <View ref={bottomRef} collapsable={false} style={styles.bottom}>
          <FeedbackLine feedback={feedback} />
          <AnswerInput
            ref={inputRef}
            value={answer}
            onChangeText={handleChangeText}
            onSubmit={handleSubmit}
            tone={tone}
            shakeKey={shakeKey}
            disabled={busy || done}
          />
          <View ref={actionsRef} collapsable={false}>
            <ActionBar
              hintCost={HINT_LETTER_PENALTY}
              // In step 3 the bar is highlighted (the dim blocks touches), so it shouldn't look disabled.
              canHint={canHint || done}
              showRestart={false}
              disabled={busy}
              onHint={handleHint}
              onReveal={handleReveal}
              onRestart={() => {}}
            />
          </View>
        </View>
      </View>

      <CarryOverLayer ghost={ghost} />
      {coach}
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
    gap: space.lg,
  },
  header: {
    // Leave room for the coach mark's Skip link at the top right.
    paddingRight: 72,
  },
  meta: {
    ...type.label,
    color: color.inkMuted,
  },
  title: {
    ...type.title,
    color: color.ink,
  },
  spacer: {
    flex: 1,
    minHeight: 0,
  },
  bottom: {
    gap: space.sm,
  },
});
