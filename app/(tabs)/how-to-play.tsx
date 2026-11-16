import React, { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { GraduationCap, Star } from 'lucide-react-native';
import { useGameDispatch } from '@/context/GameContext';
import {
  HINT_LETTER_PENALTY,
  LINK_FLOOR,
  LINK_START_VALUE,
  PERFECT_BONUS,
  THREE_STAR_MAX_WRONG,
  TWO_STAR_MAX_HINTS,
  WRONG_GUESS_PENALTY,
} from '@/lib/game';
import { guideExampleLinks } from '@/data/tutorial';
import { color, layout, radius, space, type } from '@/constants/theme';
import ClueCard from '@/components/play/ClueCard';
import LetterTiles from '@/components/play/LetterTiles';
import GuessRows from '@/components/play/GuessRows';
import ChainTrack from '@/components/play/ChainTrack';

const solvedAll = guideExampleLinks.map(() => ({ solved: true, revealed: false }));
/** The letter-check example from DESIGN_SPEC §7: answer KITTEN, guess TITLES. */
const letterCheckLink = { clue: 'A baby cat is called this', answer: 'kitten' };

/** A small illustration made from the real Play components. Hidden from screen readers (the step text says it). */
function Illustration({ children }: { children: ReactNode }) {
  return (
    <View style={styles.illustration} importantForAccessibility="no-hide-descendants" aria-hidden pointerEvents="none">
      {children}
    </View>
  );
}

function Step({ n, text, children }: { n: number; text: string; children: ReactNode }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{n}</Text>
        </View>
        <Text style={styles.stepText}>{text}</Text>
      </View>
      <Illustration>{children}</Illustration>
    </View>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <View style={styles.stars} accessible accessibilityLabel={`${count} ${count === 1 ? 'star' : 'stars'}`}>
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          size={16}
          color={i < count ? color.gold : color.inkMuted}
          fill={i < count ? color.gold : 'transparent'}
          strokeWidth={1.5}
        />
      ))}
    </View>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bullet}>
      <View style={styles.dot} />
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

export default function GuideScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useGameDispatch();

  const replayTutorial = () => {
    dispatch({ type: 'REPLAY_TUTORIAL' });
    router.navigate('/(tabs)');
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.column}>
        <Text style={styles.display} accessibilityRole="header">
          How to play
        </Text>

        <View style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">
            How it works
          </Text>
          <Step n={1} text="Read the clue and type your answer.">
            <ClueCard link={guideExampleLinks[0]} linkIndex={0} compact>
              <LetterTiles link={guideExampleLinks[0]} hintLetters={0} maxSize={30} />
            </ClueCard>
          </Step>
          <Step n={2} text="Your answer appears in the next clue, highlighted in pink.">
            <ClueCard link={guideExampleLinks[1]} linkIndex={1} compact pulse={false} />
          </Step>
          <Step n={3} text="Link 5 answers to complete the chain.">
            {/* currentIndex 0 keeps the track scrolled to the start (all slots are solved, so nothing glows). */}
            <ChainTrack chain={{ links: guideExampleLinks }} links={solvedAll} currentIndex={0} />
          </Step>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">
            Scoring
          </Text>
          <Bullet>Each link is worth up to {LINK_START_VALUE} points.</Bullet>
          <Bullet>
            A wrong guess costs {WRONG_GUESS_PENALTY}. A near miss (&ldquo;So close!&rdquo;) costs nothing.
          </Bullet>
          <Bullet>Hints cost {HINT_LETTER_PENALTY} per letter.</Bullet>
          <Bullet>
            A solved link never drops below {LINK_FLOOR}. A revealed word scores 0.
          </Bullet>
          <Bullet>Finish without hints or reveals for a +{PERFECT_BONUS} perfect bonus.</Bullet>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">
            Letter check
          </Text>
          <Text style={styles.paragraph}>
            Guess a word with the right number of letters and we&rsquo;ll mark each one: ✓ right spot, ● in the
            word but somewhere else, plain means not in the word.
          </Text>
          {/* Hidden from screen readers: the paragraph above says it. */}
          <View
            style={styles.letterCard}
            importantForAccessibility="no-hide-descendants"
            aria-hidden
            pointerEvents="none"
          >
            <LetterTiles link={letterCheckLink} hintLetters={0} maxSize={30} />
            <GuessRows link={letterCheckLink} guesses={['titles']} maxSize={36} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">
            Stars
          </Text>
          <View style={styles.starRow}>
            <Stars count={3} />
            <Text style={styles.starText}>
              No hints or reveals, and {THREE_STAR_MAX_WRONG} or fewer wrong guesses
            </Text>
          </View>
          <View style={styles.starRow}>
            <Stars count={2} />
            <Text style={styles.starText}>No reveals, and {TWO_STAR_MAX_HINTS} or fewer hint letters</Text>
          </View>
          <View style={styles.starRow}>
            <Stars count={1} />
            <Text style={styles.starText}>Chain completed</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={replayTutorial}
          accessibilityRole="button"
          accessibilityLabel="Replay the tutorial"
        >
          <GraduationCap size={20} color={color.ink} />
          <Text style={styles.buttonText}>Replay tutorial</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.bg,
  },
  content: {
    paddingHorizontal: layout.gutter,
    paddingBottom: space.xxl,
  },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    gap: space.xl,
  },
  display: {
    ...type.display,
    color: color.ink,
  },
  section: {
    gap: space.md,
  },
  heading: {
    ...type.title,
    color: color.ink,
  },
  step: {
    gap: space.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.linkFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'Play-Bold',
    fontSize: 15,
    color: color.white,
  },
  stepText: {
    ...type.body,
    flex: 1,
    color: color.ink,
  },
  illustration: {
    marginLeft: 28 + space.md,
  },
  body: {
    ...type.body,
    flex: 1,
    color: color.ink,
  },
  paragraph: {
    ...type.body,
    color: color.ink,
  },
  letterCard: {
    backgroundColor: color.card,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.link,
    marginTop: 9,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    width: 56,
    paddingTop: 4,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  starText: {
    ...type.body,
    flex: 1,
    color: color.ink,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: color.link,
  },
  buttonPressed: {
    backgroundColor: color.slotEmpty,
  },
  buttonText: {
    ...type.body,
    fontWeight: '700',
    color: color.ink,
  },
});
