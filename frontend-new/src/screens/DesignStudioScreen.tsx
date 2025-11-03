import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Dimensions 
} from 'react-native';
// Add TextInput to the imports above
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { RootStackParamList, Room, Furniture, PlacedFurniture } from '../types';
import Room2D from '../components/Room2D';
import CustomModal from '../components/CustomModal';
import FitnessCheckModal from '../components/FitnessCheckModal';
import theme from '../theme/colors';
import fonts from '../theme/fonts';


const API_BASE_URL = 'http://10.45.68.212:8000'; // ← Your IP

type DesignStudioScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DesignStudio'>;
type DesignStudioScreenRouteProp = RouteProp<RootStackParamList, 'DesignStudio'>;

interface Props {
  navigation: DesignStudioScreenNavigationProp;
  route: DesignStudioScreenRouteProp;
}

const DesignStudioScreen: React.FC<Props> = ({ navigation, route }) => {
  const { room } = route.params;
  const [furniture, setFurniture] = useState<Furniture[]>([]);
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurniture[]>([]);
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null);
  const [selectedPlacedItem, setSelectedPlacedItem] = useState<PlacedFurniture | null>(null);
  const [designName, setDesignName] = useState('');
  const [fitnessResult, setFitnessResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'furniture' | 'controls'>('furniture');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [fitnessModalVisible, setFitnessModalVisible] = useState(false);

  useEffect(() => {
    loadFurniture();
  }, []);

  const loadFurniture = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/furniture`);
      setFurniture(response.data);
    } catch (error) {
      console.error('Error loading furniture:', error);
    }
  };

  const addFurnitureToRoom = (furnitureItem: Furniture) => {
    const newItem: PlacedFurniture = {
      id: Date.now(),
      furniture: furnitureItem,
      position: { x: 2, y: 2 },
      rotation: 0
    };

    setPlacedFurniture([...placedFurniture, newItem]);
    setSelectedPlacedItem(newItem);
    setActiveTab('controls');
  };

  const removeFurniture = (id: number) => {
    setPlacedFurniture(placedFurniture.filter(item => item.id !== id));
    if (selectedPlacedItem?.id === id) {
      setSelectedPlacedItem(null);
    }
  };

  const rotateFurniture = (id: number) => {
    setPlacedFurniture(placedFurniture.map(item => 
      item.id === id 
        ? { ...item, rotation: (item.rotation + 90) % 360 }
        : item
    ));
  };

  const updateFurniturePosition = (id: number, newPosition: { x: number; y: number }) => {
    setPlacedFurniture(placedFurniture.map(item => 
      item.id === id 
        ? { ...item, position: newPosition }
        : item
    ));
  };

  const checkAllFitness = async () => {
    if (placedFurniture.length === 0) {
      Alert.alert('Error', 'Please add furniture to the room first');
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        room_id: room.id,
        furniture_items: placedFurniture.map(item => ({
          furniture_id: item.furniture.id,
          position_x: item.position.x,
          position_y: item.position.y,
          rotation: item.rotation
        }))
      };

      const response = await axios.post(`${API_BASE_URL}/check-multiple-fitness`, requestData);
      setFitnessResult(response.data);
      setFitnessModalVisible(true); // Show fitness modal instead of tab
    } catch (error) {
      showModal('error', 'Fitness Check Failed', 'Unable to check fitness. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const saveDesign = async () => {
    if (!designName.trim()) {
      showModal('error', 'Design Name Required', 'Please enter a name for your design before saving.');
      return;
    }

    if (placedFurniture.length === 0) {
      showModal('info', 'No Furniture Added', 'Add some furniture to your room before saving the design.');
      return;
    }

    try {
      const designData = {
        room_id: room.id,
        name: designName,
        furniture_items: placedFurniture.map(item => ({
          furniture_id: item.furniture.id,
          position_x: item.position.x,
          position_y: item.position.y,
          rotation: item.rotation
        }))
      };

      const response = await axios.post(`${API_BASE_URL}/save-design`, designData);
      showModal('success', 'Design Saved! 🎉', `Your design "${designName}" has been saved successfully. You can find it in your saved designs.`);
      setDesignName('');
      // Navigate to saved designs after a delay if needed
      setTimeout(() => {
        // Optional: navigation.navigate('SavedDesigns');
      }, 2000);
    } catch (error) {
      showModal('error', 'Save Failed', 'Unable to save your design. Please check your connection and try again.');
    }
  };

  const FurnitureControls = () => {
    if (!selectedPlacedItem) {
      return (
        <View style={styles.controlsContainer}>
          <Text style={styles.noSelectionText}>Select a furniture item to adjust its position</Text>
        </View>
      );
    }

    return (
      <View style={styles.controlsContainer}>
        <Text style={styles.controlsTitle}>
          Editing: {selectedPlacedItem.furniture.name}
        </Text>
        
        <View style={styles.controlButtons}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => rotateFurniture(selectedPlacedItem.id)}
          >
            <Text style={styles.controlButtonText}>🔄 Rotate</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, styles.dangerButton]}
            onPress={() => removeFurniture(selectedPlacedItem.id)}
          >
            <Text style={styles.controlButtonText}>🗑️ Remove</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.positionSection}>
          <Text style={styles.positionTitle}>Position</Text>
          <Text style={styles.positionText}>
            X: {selectedPlacedItem.position.x}ft • Y: {selectedPlacedItem.position.y}ft
          </Text>
          
          <View style={styles.positionGrid}>
            <View style={styles.positionRow}>
              <TouchableOpacity 
                style={styles.positionButton}
                onPress={() => updateFurniturePosition(
                  selectedPlacedItem.id,
                  { x: selectedPlacedItem.position.x - 0.5, y: selectedPlacedItem.position.y }
                )}
              >
                <Text>←</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.positionButton}
                onPress={() => updateFurniturePosition(
                  selectedPlacedItem.id,
                  { x: selectedPlacedItem.position.x, y: selectedPlacedItem.position.y - 0.5 }
                )}
              >
                <Text>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.positionButton}
                onPress={() => updateFurniturePosition(
                  selectedPlacedItem.id,
                  { x: selectedPlacedItem.position.x + 0.5, y: selectedPlacedItem.position.y }
                )}
              >
                <Text>→</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.positionRow}>
              <TouchableOpacity 
                style={styles.positionButton}
                onPress={() => updateFurniturePosition(
                  selectedPlacedItem.id,
                  { x: selectedPlacedItem.position.x, y: selectedPlacedItem.position.y + 0.5 }
                )}
              >
                <Text>↓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const FurnitureCatalog = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Add Furniture to Room</Text>
      <View style={styles.furnitureGrid}>
        {furniture.map(item => (
          <TouchableOpacity 
            key={item.id}
            style={styles.furnitureThumbnail}
            onPress={() => addFurnitureToRoom(item)}
          >
            <Text style={styles.furnitureThumbnailText}>{item.name}</Text>
            <Text style={styles.furnitureSize}>{item.width}×{item.depth}ft</Text>
            <Text style={styles.furnitureType}>{item.type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <CustomModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
        primaryButtonText="Got it!"
      />
      <FitnessCheckModal
        visible={fitnessModalVisible}
        allFits={fitnessResult?.all_fits || false}
        results={fitnessResult?.results || []}
        overallMessage={fitnessResult?.overall_message || 'Checking fitness...'}
        onClose={() => setFitnessModalVisible(false)}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>🎨 Design Studio</Text>
          <Text style={styles.subtitle}>{room.name}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* 2D Visualization */}
      <View style={styles.visualizationSection}>
        <Room2D
          room={room}
          placedFurniture={placedFurniture}
          selectedItem={selectedPlacedItem}
          fitnessResult={fitnessResult}
          onSelectItem={setSelectedPlacedItem}
          onUpdatePosition={updateFurniturePosition}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.actionButton, placedFurniture.length === 0 && styles.actionButtonDisabled]}
          onPress={checkAllFitness}
          disabled={placedFurniture.length === 0 || loading}
        >
          <Text style={styles.actionButtonText}>
            {loading ? '🔍 Checking...' : '✅ Check Fitness'}
          </Text>
        </TouchableOpacity>

        <View style={styles.saveSection}>
          <TextInput
            style={styles.designNameInput}
            placeholder="Design name"
            value={designName}
            onChangeText={setDesignName}
          />
          <TouchableOpacity 
            style={[styles.saveButton, !designName.trim() && styles.saveButtonDisabled]}
            onPress={saveDesign}
            disabled={!designName.trim()}
          >
            <Text style={styles.saveButtonText}>💾 Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabHeaders}>
          <TouchableOpacity 
            style={[styles.tabHeader, activeTab === 'furniture' && styles.activeTabHeader]}
            onPress={() => setActiveTab('furniture')}
          >
            <Text style={[styles.tabHeaderText, activeTab === 'furniture' && styles.activeTabHeaderText]}>
              🛋️ Furniture
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabHeader, activeTab === 'controls' && styles.activeTabHeader]}
            onPress={() => setActiveTab('controls')}
          >
            <Text style={[styles.tabHeaderText, activeTab === 'controls' && styles.activeTabHeaderText]}>
              🎛️ Controls
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContentContainer}>
          {activeTab === 'furniture' && <FurnitureCatalog />}
          {activeTab === 'controls' && <FurnitureControls />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.medium,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  backButtonText: {
    fontSize: 17,
    color: theme.colors.white,
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerRight: {
    width: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.primaryLighter,
    marginTop: theme.spacing.xs,
  },
  visualizationSection: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  actionButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  saveSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  designNameInput: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    fontSize: 14,
    width: 140,
    color: theme.colors.textPrimary,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabsContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  tabHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.primaryLighter + '20',
  },
  tabHeader: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  activeTabHeader: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  tabHeaderText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabHeaderText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  tabContentContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  tabContent: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  furnitureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  furnitureThumbnail: {
    width: '48%',
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLighter,
    ...theme.shadows.small,
  },
  furnitureThumbnailText: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  furnitureSize: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  furnitureType: {
    fontSize: 11,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  noSelectionText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    fontSize: 17,
  },
  controlsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: theme.colors.textPrimary,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  controlButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 110,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
  },
  controlButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  positionSection: {
    alignItems: 'center',
  },
  positionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  positionText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontWeight: '500',
  },
  positionGrid: {
    alignItems: 'center',
  },
  positionRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  positionButton: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    margin: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  resultsContainer: {
    flex: 1,
  },
  overallResult: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  overallResultText: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultItem: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 4,
    ...theme.shadows.small,
  },
  resultItemTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  resultMessage: {
    fontSize: 15,
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  collisionText: {
    color: theme.colors.error,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    fontSize: 14,
  },
  spaceText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  noResultsText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    fontSize: 17,
    marginTop: theme.spacing.xxl,
  },
});

export default DesignStudioScreen;