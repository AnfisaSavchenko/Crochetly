/**
 * AuthButton Component
 * Neo-Brutalist authentication button for Apple/Google
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Fonts, BorderRadius, Shadow } from '@/constants/theme';

interface AuthButtonProps {
  provider: 'apple' | 'google';
  onPress: () => void;
  style?: ViewStyle;
  loading?: boolean;
  disabled?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  provider,
  onPress,
  style,
  loading = false,
  disabled = false,
}) => {
  const isApple = provider === 'apple';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <>
          <View style={styles.iconContainer}>
            <Ionicons
              name={isApple ? 'logo-apple' : 'logo-google'}
              size={24}
              color={Colors.text}
            />
          </View>
          <Text style={styles.buttonText}>
            Continue with {isApple ? 'Apple' : 'Google'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.card,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.stroke,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    ...Shadow.brutal,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
});
