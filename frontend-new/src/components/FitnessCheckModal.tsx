import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import theme from '../theme/colors';

interface FitnessResult {
  furniture_id: number;
  furniture_name: string;
  fits: boolean;
  collisions: string[];
  adequate_space: boolean;
  walking_space_x: number;
  walking_space_y: number;
  message: string;
}

interface FitnessCheckModalProps {
  visible: boolean;
  allFits: boolean;
  results: FitnessResult[];
  overallMessage: string;
  onClose: () => void;
}

const FitnessCheckModal: React.FC<FitnessCheckModalProps> = ({
  visible,
  allFits,
  results,
  overallMessage,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: scaleAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: allFits ? theme.colors.successLight : theme.colors.errorLight }]}>
            <Text style={styles.headerIcon}>{allFits ? '✅' : '⚠️'}</Text>
            <Text style={[styles.headerTitle, { color: allFits ? theme.colors.success : theme.colors.error }]}>
              Fitness Check Results
            </Text>
          </View>

          {/* Overall Result */}
          <View style={[styles.overallResult, { backgroundColor: allFits ? theme.colors.successLight : theme.colors.errorLight }]}>
            <Text style={[styles.overallMessage, { color: allFits ? theme.colors.success : theme.colors.error }]}>
              {overallMessage}
            </Text>
          </View>

          {/* Individual Results */}
          <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
            {results.map((result, index) => (
              <View
                key={index}
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: result.fits && !result.collisions.length
                      ? theme.colors.successLight + '40'
                      : theme.colors.errorLight + '40',
                    borderLeftColor: result.fits && !result.collisions.length
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.furnitureIcon}>
                    {result.fits && !result.collisions.length ? '✅' : '❌'}
                  </Text>
                  <Text style={styles.furnitureName}>{result.furniture_name}</Text>
                </View>

                <Text style={[styles.resultMessage, { color: result.fits && !result.collisions.length ? theme.colors.success : theme.colors.error }]}>
                  {result.message}
                </Text>

                {result.collisions.length > 0 && (
                  <View style={styles.collisionSection}>
                    <Text style={styles.collisionTitle}>⚠️ Collisions with:</Text>
                    {result.collisions.map((collision, idx) => (
                      <Text key={idx} style={styles.collisionItem}>• {collision}</Text>
                    ))}
                  </View>
                )}

                <View style={styles.spaceInfo}>
                  <Text style={styles.spaceLabel}>Walking Space:</Text>
                  <Text style={styles.spaceValue}>
                    X: {result.walking_space_x.toFixed(1)}ft • Y: {result.walking_space_y.toFixed(1)}ft
                  </Text>
                  <Text style={[
                    styles.spaceStatus,
                    { color: result.adequate_space ? theme.colors.success : theme.colors.warning }
                  ]}>
                    {result.adequate_space ? '✓ Adequate' : '⚠ Low'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: allFits ? theme.colors.success : theme.colors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Got it!</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 450,
    maxHeight: '80%',
    ...theme.shadows.large,
  },
  header: {
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  headerIcon: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  overallResult: {
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  overallMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    maxHeight: 400,
    paddingHorizontal: theme.spacing.md,
  },
  resultCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 4,
    ...theme.shadows.small,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  furnitureIcon: {
    fontSize: 20,
  },
  furnitureName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  resultMessage: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  collisionSection: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
  },
  collisionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  collisionItem: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  spaceInfo: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  spaceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  spaceValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
  spaceStatus: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  closeButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FitnessCheckModal;



