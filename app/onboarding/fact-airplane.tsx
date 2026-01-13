/**
 * Onboarding Screen 3: Did You Know? - Flight Time
 * Displays cute crochet airplane with flight comparison fact
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StrokedText } from '@/components';
import { CTAButton } from './components';
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme';

export default function FactAirplaneScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    router.push('/onboarding/quiz-level');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xxl,
            paddingBottom: insets.bottom + Spacing.xxl + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Title */}
        <View style={styles.titleContainer}>
          <StrokedText fontSize={42} lineHeight={50}>
            Did you know?
          </StrokedText>
        </View>

        {/* Hero Image - Airplane */}
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/fromlondontoparis.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Fact Text */}
        <Text style={styles.factText}>
          Making two crochet toys equals{'\n'}
          the length of a flight{'\n'}
          from London to Paris.
        </Text>

        {/* Flexible spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xl }} />

        {/* Continue Button */}
        <CTAButton
          title="Continue"
          onPress={handleContinue}
          style={styles.button}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  titleContainer: {
    marginBottom: Spacing.xxl,
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: Spacing.xxl,
    alignItems: 'center',
  },
  heroImage: {
    width: 280,
    height: 280,
  },
  factText: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.light,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: Spacing.xl,
  },
  button: {
    width: '100%',
  },
});
