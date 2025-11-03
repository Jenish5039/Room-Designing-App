import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import theme from '../theme/colors';
import fonts from '../theme/fonts';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const features = [
  {
    id: 1,
    emoji: '🏠',
    title: 'Create Your First Room',
    description: 'Start by designing your room with custom dimensions. Create the perfect space layout.',
    action: 'Get Started',
    navigate: 'RoomCreation' as const,
    params: undefined,
  },
  {
    id: 2,
    emoji: '🎨',
    title: 'Design Your Space',
    description: 'Arrange furniture in 2D with real-time fitness checking. See how everything fits perfectly.',
    action: 'Start Designing',
    navigate: 'DesignStudio' as const,
    params: { room: { id: 0, name: 'New Design', width: 12, depth: 10 } },
  },
  {
    id: 3,
    emoji: '🛋️',
    title: 'Browse Furniture Catalog',
    description: 'Explore our collection of furniture items. Find the perfect pieces for your design.',
    action: 'Browse Catalog',
    navigate: 'FurnitureCatalog' as const,
    params: { onSelectFurniture: () => {} },
  },
  {
    id: 4,
    emoji: '💾',
    title: 'View Saved Designs',
    description: 'Access and manage all your saved room designs. Edit or create new ones.',
    action: 'View Designs',
    navigate: 'SavedDesigns' as const,
    params: undefined,
  },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];

  const handleFeaturePress = (feature: typeof features[0]) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (feature.params) {
      navigation.navigate(feature.navigate, feature.params);
    } else {
      navigation.navigate(feature.navigate);
    }
  };

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentFeature = features[currentStep];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleEmoji}>✨</Text>
            <Text style={styles.title}>Space Designer</Text>
          </View>
          <Text style={styles.subtitle}>Transform your vision into reality</Text>
          <View style={styles.progressContainer}>
            {features.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <Animated.View style={[styles.cardsContainer, { opacity: fadeAnim }]}>
        {/* Progressive Feature Card */}
        <View style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <Text style={styles.featureEmoji}>{currentFeature.emoji}</Text>
            <View style={styles.featureStepIndicator}>
              <Text style={styles.featureStepText}>Step {currentStep + 1} of {features.length}</Text>
            </View>
          </View>
          
          <Text style={styles.featureTitle}>{currentFeature.title}</Text>
          <Text style={styles.featureDescription}>{currentFeature.description}</Text>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => handleFeaturePress(currentFeature)}
            activeOpacity={0.8}
          >
            <Text style={styles.featureButtonText}>{currentFeature.action} →</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Controls */}
        <View style={styles.navigationControls}>
          <TouchableOpacity
            style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentStep === 0}
          >
            <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>← Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, currentStep === features.length - 1 && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={currentStep === features.length - 1}
          >
            <Text style={[styles.navButtonText, currentStep === features.length - 1 && styles.navButtonTextDisabled]}>Next →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Access (Hidden, shown after all steps) */}
        {currentStep === features.length - 1 && (
          <View style={styles.quickAccessContainer}>
            <Text style={styles.quickAccessTitle}>Quick Access</Text>
            <View style={styles.quickAccessGrid}>
              {features.slice(0, 2).map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAccessCard}
                  onPress={() => handleFeaturePress(feature)}
                >
                  <Text style={styles.quickAccessIcon}>{feature.emoji}</Text>
                  <Text style={styles.quickAccessText}>{feature.title.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.large,
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleEmoji: {
    fontSize: 36,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: theme.colors.white,
    letterSpacing: 1,
    ...fonts.heading,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.white + '40',
    marginHorizontal: 3,
  },
  progressDotActive: {
    backgroundColor: theme.colors.white,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressDotCompleted: {
    backgroundColor: theme.colors.primaryLighter,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.primaryLighter,
    fontWeight: '500',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  headerDecorations: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  decoration: {
    fontSize: 24,
    opacity: 0.8,
  },
  cardsContainer: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  featureCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.large,
    borderWidth: 2,
    borderColor: theme.colors.primary + '20',
    alignItems: 'center',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  featureEmoji: {
    fontSize: 64,
  },
  featureStepIndicator: {
    backgroundColor: theme.colors.primaryLighter,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  featureStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    ...fonts.caption,
  },
  featureTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    ...fonts.heading,
  },
  featureDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
    textAlign: 'center',
    ...fonts.body,
  },
  featureButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  featureButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    ...fonts.button,
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  navButton: {
    flex: 1,
    backgroundColor: theme.colors.primaryLighter,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
    ...theme.shadows.small,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    ...fonts.bodyBold,
  },
  navButtonTextDisabled: {
    color: theme.colors.textLight,
  },
  quickAccessContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  quickAccessTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    ...fonts.subheading,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.spacing.md,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: theme.colors.primaryLighter,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
    ...theme.shadows.small,
  },
  quickAccessIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  quickAccessText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    ...fonts.caption,
  },
});

export default HomeScreen; // ← This is the default export that was missing