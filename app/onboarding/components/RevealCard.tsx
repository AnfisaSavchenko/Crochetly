/**
 * RevealCard Component
 * Interactive card with dashed border that reveals content when tapped
 */

import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors, Spacing, FontSize, Fonts, BorderRadius } from '@/constants/theme';

interface RevealCardProps {
  hiddenText: string;
  revealedText: string;
}

export const RevealCard: React.FC<RevealCardProps> = ({
  hiddenText,
  revealedText,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (!isRevealed) {
      // Pop-in animation
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      setIsRevealed(true);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      disabled={isRevealed}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleValue }],
            backgroundColor: isRevealed ? Colors.primary : Colors.card,
            borderStyle: isRevealed ? 'solid' : 'dashed',
          },
        ]}
      >
        <Text style={[styles.text, isRevealed && styles.revealedText]}>
          {isRevealed ? revealedText : hiddenText}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.stroke,
    borderRadius: BorderRadius.lg,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.light,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  revealedText: {
    fontFamily: Fonts.heavy,
  },
});
