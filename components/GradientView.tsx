import React from 'react';
import { View, Platform, ViewStyle } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

type GradientViewProps = {
  colors: string[];
  style?: ViewStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
};

export function GradientView({ colors, style, start, end, children }: GradientViewProps) {
  if (Platform.OS === 'web') {
    return (
      <View 
        style={[
          style,
          {
            backgroundColor: colors[0],
            backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
          } as ViewStyle,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <ExpoLinearGradient
      colors={colors as any}
      style={style}
      start={start || { x: 0, y: 0 }}
      end={end || { x: 1, y: 1 }}
    >
      {children}
    </ExpoLinearGradient>
  );
} 