/**
 * Floating Action Button Component
 * Prominent button for creating new projects
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow } from '@/constants/theme';

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  testID?: string;
}

const SIZE_MAP = {
  small: 48,
  medium: 56,
  large: 64,
};

const ICON_SIZE_MAP = {
  small: 24,
  medium: 28,
  large: 32,
};

export const FAB: React.FC<FABProps> = ({
  onPress,
  icon = 'add',
  style,
  size = 'large',
  color = Colors.textOnPrimary,
  backgroundColor = Colors.primary,
  testID,
}) => {
  const buttonSize = SIZE_MAP[size];
  const iconSize = ICON_SIZE_MAP[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID}
      style={[
        styles.fab,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.large,
  },
});

export default FAB;
