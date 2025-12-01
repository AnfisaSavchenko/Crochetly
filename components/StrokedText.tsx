/**
 * StrokedText Component
 * Renders text with a black outline effect using the Layered Text technique
 * Simulates CSS -webkit-text-stroke by rendering 4 black copies behind pink text
 */

import React from 'react';
import { View, Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { Fonts, FontSize } from '@/constants/theme';

// Default colors matching the design spec
const DEFAULT_PINK = '#ECA9BA';
const DEFAULT_STROKE = '#000000';

interface StrokedTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  fontSize?: number;
  color?: string;
  strokeColor?: string;
  lineHeight?: number;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
}

export const StrokedText: React.FC<StrokedTextProps> = ({
  children,
  style,
  fontSize = FontSize.hero,
  color = DEFAULT_PINK,
  strokeColor = DEFAULT_STROKE,
  lineHeight = 45,
  textAlign = 'center',
  numberOfLines,
}) => {
  // 4-direction offsets for stroke effect (1px in each cardinal direction)
  const strokeOffsets = [
    { top: -1, left: 0 },   // Top
    { top: 1, left: 0 },    // Bottom
    { top: 0, left: -1 },   // Left
    { top: 0, left: 1 },    // Right
  ];

  const baseTextStyle: TextStyle = {
    fontFamily: Fonts.heavy,
    fontSize,
    lineHeight,
    textAlign,
  };

  return (
    <View style={styles.container}>
      {/* 4 Black stroke layers positioned behind */}
      {strokeOffsets.map((offset, index) => (
        <Text
          key={index}
          style={[
            baseTextStyle,
            styles.strokeLayer,
            {
              color: strokeColor,
              top: offset.top,
              left: offset.left,
            },
            style,
          ]}
          numberOfLines={numberOfLines}
        >
          {children}
        </Text>
      ))}

      {/* Main pink text on top */}
      <Text
        style={[
          baseTextStyle,
          {
            color,
          },
          style,
        ]}
        numberOfLines={numberOfLines}
      >
        {children}
      </Text>
    </View>
  );
};

// Alternative export for backwards compatibility
export const LayeredStrokedText = StrokedText;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  strokeLayer: {
    position: 'absolute',
  },
});

export default StrokedText;
