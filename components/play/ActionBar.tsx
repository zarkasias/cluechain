import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Eye, Lightbulb, LucideIcon, RotateCcw } from 'lucide-react-native';
import { color, radius, space, type } from '@/constants/theme';

type ActionBarProps = {
  hintCost: number;
  canHint: boolean;
  showRestart: boolean;
  disabled?: boolean;
  onHint: () => void;
  onReveal: () => void;
  onRestart: () => void;
};

type ActionProps = {
  Icon: LucideIcon;
  label: string;
  a11yLabel: string;
  onPress: () => void;
  disabled?: boolean;
};

function Action({ Icon, label, a11yLabel, onPress, disabled }: ActionProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.action, disabled && styles.disabled, pressed && styles.pressed]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled: !!disabled }}
    >
      <Icon size={18} color={color.inkMuted} />
      <Text style={styles.label} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ActionBar({ hintCost, canHint, showRestart, disabled, onHint, onReveal, onRestart }: ActionBarProps) {
  return (
    <View style={styles.row}>
      <Action
        Icon={Lightbulb}
        label={`Hint −${hintCost}`}
        a11yLabel={`Hint, costs ${hintCost} points`}
        onPress={onHint}
        disabled={disabled || !canHint}
      />
      <Action Icon={Eye} label="Reveal" a11yLabel="Reveal word" onPress={onReveal} disabled={disabled} />
      {showRestart && (
        <Action Icon={RotateCcw} label="Restart" a11yLabel="Restart chain" onPress={onRestart} disabled={disabled} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
  },
  pressed: {
    backgroundColor: color.slotEmpty,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...type.body,
    fontWeight: '600',
    color: color.inkMuted,
  },
});
