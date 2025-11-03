import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Room, PlacedFurniture } from '../types';
import theme from '../theme/colors';

interface Room2DProps {
  room: Room;
  placedFurniture: PlacedFurniture[];
  selectedItem: PlacedFurniture | null;
  fitnessResult?: any;
  onSelectItem: (item: PlacedFurniture) => void;
  onUpdatePosition: (id: number, position: { x: number; y: number }) => void;
}

const Room2D: React.FC<Room2DProps> = ({
  room,
  placedFurniture,
  selectedItem,
  fitnessResult,
  onSelectItem,
  onUpdatePosition,
}) => {
  const scale = 15;
  const roomWidth = room.width * scale;
  const roomDepth = room.depth * scale;
  const maxWidth = Dimensions.get('window').width - 60;

  const actualScale = roomWidth > maxWidth ? maxWidth / room.width : scale;
  const actualRoomWidth = room.width * actualScale;
  const actualRoomDepth = room.depth * actualScale;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎨 2D Room Layout</Text>
      <Text style={styles.subtitle}>
        {room.name} ({room.width}ft × {room.depth}ft) • {placedFurniture.length} items
      </Text>
      
      <View style={[styles.roomOutline, { width: actualRoomWidth, height: actualRoomDepth }]}>
        <Text style={styles.roomLabel}>
          {room.name}
        </Text>
        
        {placedFurniture.map(item => {
          const isSelected = selectedItem?.id === item.id;
          const furnitureResult = fitnessResult?.results?.find(
            (r: any) => r.furniture_id === item.furniture.id
          );
          
          const width = item.rotation % 180 === 0 ? item.furniture.width : item.furniture.depth;
          const depth = item.rotation % 180 === 0 ? item.furniture.depth : item.furniture.width;
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.furnitureItem,
                { 
                  width: width * actualScale,
                  height: depth * actualScale,
                  left: item.position.x * actualScale,
                  top: item.position.y * actualScale,
                  backgroundColor: furnitureResult?.fits && !furnitureResult?.collisions?.length 
                    ? '#4CAF50' 
                    : '#F44336',
                  borderWidth: isSelected ? 3 : 1,
                  borderColor: isSelected ? '#2196F3' : '#333',
                  transform: [{ rotate: `${item.rotation}deg` }]
                }
              ]}
              onPress={() => onSelectItem(item)}
            >
              <Text style={styles.furnitureLabel}>
                {item.furniture.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {fitnessResult && (
        <View style={[
          styles.resultIndicator,
          { backgroundColor: fitnessResult.all_fits ? '#E8F5E8' : '#FFEBEE' }
        ]}>
          <Text style={[
            styles.resultText,
            { color: fitnessResult.all_fits ? '#2E7D32' : '#C62828' }
          ]}>
            {fitnessResult.overall_message}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  roomOutline: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLighter + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
    position: 'relative',
    ...theme.shadows.medium,
    borderRadius: theme.borderRadius.md,
  },
  roomLabel: {
    position: 'absolute',
    top: theme.spacing.xs,
    left: theme.spacing.xs,
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  furnitureItem: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.small,
  },
  furnitureLabel: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  resultIndicator: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    alignItems: 'center',
    width: '100%',
    ...theme.shadows.small,
  },
  resultText: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Room2D;