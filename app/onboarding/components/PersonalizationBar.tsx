/**
 * PersonalizationBar Component
 * Persistent footer bar showing onboarding progress with spinning yarn emoji
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Fonts, NeoBrutalist } from '@/constants/theme';

interface PersonalizationBarProps {
  text: string;
}

export const PersonalizationBar: React.FC<PersonalizationBarProps> = ({ text }) => {
  const insets = useSafeAreaInsets();
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Create spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + Spacing.md,
        },
      ]}
    >
      <Animated.Text
        style={[
          styles.emoji,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        🧶
      </Animated.Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: NeoBrutalist.borderWidth,
    borderTopColor: NeoBrutalist.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  emoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  text: {
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.text,
    flex: 1,
  },
});
