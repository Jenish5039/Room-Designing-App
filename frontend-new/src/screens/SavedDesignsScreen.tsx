import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, RefreshControl } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { RootStackParamList, Design, Room } from '../types';
import theme from '../theme/colors';

const API_BASE_URL = 'http://10.45.68.212:8000'; // ← Your IP

type SavedDesignsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SavedDesigns'>;

interface Props {
  navigation: SavedDesignsScreenNavigationProp;
}

const SavedDesignsScreen: React.FC<Props> = ({ navigation }) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [roomsResponse, designsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/rooms`),
        axios.get(`${API_BASE_URL}/saved-designs`)
      ]);
      
      setRooms(roomsResponse.data);
      
      // Transform API response to Design format
      const transformedDesigns: Design[] = designsResponse.data.map((design: any) => ({
        id: design.id,
        name: design.name,
        room_id: design.room_id,
        furniture_items: design.furniture_items || [],
        created_at: design.created_at
      }));
      
      setDesigns(transformedDesigns);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load designs');
    } finally {
      setRefreshing(false);
    }
  };

  const loadDesign = (design: Design) => {
    const room = rooms.find(r => r.id === design.room_id);
    if (room) {
      navigation.navigate('DesignStudio', { 
        room: { ...room, name: design.name } 
      });
    } else {
      Alert.alert('Error', 'Room not found for this design');
    }
  };

  const deleteDesign = async (designId: number) => {
    Alert.alert(
      'Delete Design',
      'Are you sure you want to delete this design? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/saved-designs/${designId}`);
              setDesigns(designs.filter(d => d.id !== designId));
              Alert.alert('Success', 'Design deleted successfully');
            } catch (error) {
              console.error('Error deleting design:', error);
              Alert.alert('Error', 'Failed to delete design. Please try again.');
            }
          }
        }
      ]
    );
  };

  const duplicateDesign = (design: Design) => {
    const newDesign: Design = {
      ...design,
      id: Date.now(),
      name: `${design.name} (Copy)`,
      created_at: new Date().toISOString().split('T')[0]
    };
    setDesigns([newDesign, ...designs]);
    Alert.alert('Success', 'Design duplicated successfully');
  };

  const getRoomName = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    return room?.name || 'Unknown Room';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredDesigns = activeFilter === 'recent' 
    ? designs.filter(d => {
        const designDate = new Date(d.created_at || '');
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return designDate > weekAgo;
      })
    : designs;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadData} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>💾 Saved Designs</Text>
        <Text style={styles.subtitle}>Your creative room layouts</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'all' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
            All Designs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'recent' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('recent')}
        >
          <Text style={[styles.filterText, activeFilter === 'recent' && styles.activeFilterText]}>
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Designs Grid */}
      <View style={styles.designsContainer}>
        <Text style={styles.sectionTitle}>
          {filteredDesigns.length} Design{filteredDesigns.length !== 1 ? 's' : ''}
        </Text>

        {filteredDesigns.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎨</Text>
            <Text style={styles.emptyStateTitle}>No Designs Yet</Text>
            <Text style={styles.emptyStateText}>
              {activeFilter === 'recent' 
                ? "You haven't created any designs in the past week."
                : "Create your first room design to get started!"
              }
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => navigation.navigate('RoomCreation')}
            >
              <Text style={styles.createButtonText}>Create First Design</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.designsGrid}>
            {filteredDesigns.map(design => (
              <View key={design.id} style={styles.designCard}>
                <View style={styles.designHeader}>
                  <View style={styles.designIcon}>
                    <Text>🎨</Text>
                  </View>
                  <View style={styles.designInfo}>
                    <Text style={styles.designName}>{design.name}</Text>
                    <Text style={styles.designRoom}>
                      {getRoomName(design.room_id)}
                    </Text>
                    <Text style={styles.designDate}>
                      {formatDate(design.created_at || '')}
                    </Text>
                  </View>
                </View>

                <View style={styles.designStats}>
                  <Text style={styles.designStat}>
                    {design.furniture_items.length} items
                  </Text>
                  <Text style={styles.designStat}>•</Text>
                  <Text style={styles.designStat}>
                    {design.furniture_items.filter(item => item.furniture.type === 'sofa').length} sofas
                  </Text>
                </View>

                <View style={styles.designActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => loadDesign(design)}
                  >
                    <Text style={styles.actionButtonText}>🎨 Open</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.secondaryAction]}
                    onPress={() => duplicateDesign(design)}
                  >
                    <Text style={styles.secondaryActionText}>📋 Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.dangerAction]}
                    onPress={() => deleteDesign(design.id)}
                  >
                    <Text style={styles.dangerActionText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('RoomCreation')}
          >
            <Text style={styles.quickActionIcon}>🏠</Text>
            <Text style={styles.quickActionText}>New Room</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('DesignStudio', { 
              room: { id: 0, name: 'Quick Design', width: 12, depth: 10 } 
            })}
          >
            <Text style={styles.quickActionIcon}>⚡</Text>
            <Text style={styles.quickActionText}>Quick Design</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={loadData}
          >
            <Text style={styles.quickActionIcon}>🔄</Text>
            <Text style={styles.quickActionText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 17,
    color: theme.colors.primaryLighter,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    ...theme.shadows.medium,
  },
  filterTab: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeFilterText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  designsContainer: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  emptyStateIcon: {
    fontSize: 56,
    marginBottom: theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  createButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  designsGrid: {
    // Designs will stack vertically
  },
  designCard: {
    backgroundColor: theme.colors.primaryLighter + '30',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  designHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  designIcon: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    ...theme.shadows.small,
  },
  designInfo: {
    flex: 1,
  },
  designName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  designRoom: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  designDate: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
  designStats: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  designStat: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
    fontWeight: '500',
  },
  designActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    flex: 1,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  secondaryAction: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  dangerAction: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.error,
    flex: 0.6,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  secondaryActionText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  dangerActionText: {
    color: theme.colors.error,
    fontWeight: '600',
    fontSize: 13,
  },
  quickActions: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  quickAction: {
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLighter,
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
    ...theme.shadows.small,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});

export default SavedDesignsScreen;