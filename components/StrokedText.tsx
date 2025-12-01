/**
 * StrokedText Component
 * Renders text with a black outline effect (Neo-Brutalist style)
 * Achieves the "Pink Text with Black Outline" look using text shadows
 */

import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { Colors, Fonts, FontSize } from '@/constants/theme';

interface StrokedTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  fontSize?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export const StrokedText: React.FC<StrokedTextProps> = ({
  children,
  style,
  fontSize = FontSize.hero,
  color = Colors.primary,
  strokeColor = Colors.stroke,
  strokeWidth = 1.5,
}) => {
  // Calculate outline offset for shadow effect
  const outlineOffset = strokeWidth;

  return (
    <Text
      style={[
        styles.text,
        {
          fontSize,
          color,
          textShadowColor: strokeColor,
          textShadowOffset: { width: outlineOffset, height: outlineOffset },
          textShadowRadius: outlineOffset,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

// Alternative implementation using layered text for more precise outline
interface LayeredStrokedTextProps extends StrokedTextProps {
  // Use layered approach for better outline on Android
  useLayered?: boolean;
}

export const LayeredStrokedText: React.FC<LayeredStrokedTextProps> = ({
  children,
  style,
  fontSize = FontSize.hero,
  color = Colors.primary,
  strokeColor = Colors.stroke,
  strokeWidth = 2,
}) => {
  const offsets = [
    { left: -strokeWidth, top: 0 },
    { left: strokeWidth, top: 0 },
    { left: 0, top: -strokeWidth },
    { left: 0, top: strokeWidth },
    { left: -strokeWidth, top: -strokeWidth },
    { left: strokeWidth, top: -strokeWidth },
    { left: -strokeWidth, top: strokeWidth },
    { left: strokeWidth, top: strokeWidth },
  ];

  return (
    <>
      {/* Stroke layers */}
      {offsets.map((offset, index) => (
        <Text
          key={index}
          style={[
            styles.text,
            styles.absoluteText,
            {
              fontSize,
              color: strokeColor,
              left: offset.left,
              top: offset.top,
            },
            style,
          ]}
        >
          {children}
        </Text>
      ))}
      {/* Main text on top */}
      <Text
        style={[
          styles.text,
          {
            fontSize,
            color,
          },
          style,
        ]}
      >
        {children}
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.heavy,
    fontWeight: '900',
  },
  absoluteText: {
    position: 'absolute',
  },
});

export default StrokedText;
