import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { RootStackParamList, Room } from '../types';
import theme from '../theme/colors';

const API_BASE_URL = 'http://10.45.68.212:8000'; // ← Your IP

type RoomCreationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RoomCreation'>;

interface Props {
  navigation: RoomCreationScreenNavigationProp;
}

const RoomCreationScreen: React.FC<Props> = ({ navigation }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState({ name: '', width: '', depth: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rooms`);
      setRooms(response.data);
    } catch (error) {
      Alert.alert('Error', 'Cannot load rooms from backend');
    }
  };

  const createRoom = async () => {
    if (!newRoom.name || !newRoom.width || !newRoom.depth) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/rooms`, {
        name: newRoom.name,
        width: parseFloat(newRoom.width),
        depth: parseFloat(newRoom.depth)
      });
      
      setNewRoom({ name: '', width: '', depth: '' });
      loadRooms();
      Alert.alert('Success', 'Room created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const navigateToDesign = (room: Room) => {
    navigation.navigate('DesignStudio', { room });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏠 Create Room</Text>
        <Text style={styles.subtitle}>Design your space with perfect dimensions</Text>
      </View>

      {/* Create New Room Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create New Room</Text>
        <TextInput
          style={styles.input}
          placeholder="Room Name (e.g., Living Room)"
          value={newRoom.name}
          onChangeText={(text) => setNewRoom({...newRoom, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Width (feet)"
          keyboardType="numeric"
          value={newRoom.width}
          onChangeText={(text) => setNewRoom({...newRoom, width: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Depth (feet)"
          keyboardType="numeric"
          value={newRoom.depth}
          onChangeText={(text) => setNewRoom({...newRoom, depth: text})}
        />
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={createRoom}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Room'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Existing Rooms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Your Rooms ({rooms.length})
        </Text>
        {rooms.length === 0 ? (
          <Text style={styles.noItemsText}>No rooms created yet. Create your first room above!</Text>
        ) : (
          rooms.map(room => (
            <TouchableOpacity 
              key={room.id} 
              style={styles.roomItem}
              onPress={() => navigateToDesign(room)}
            >
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomDimensions}>{room.width}ft × {room.depth}ft</Text>
              </View>
              <Text style={styles.navigateButton}>🎨 Design →</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick Templates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Templates</Text>
        <View style={styles.templatesContainer}>
          <TouchableOpacity 
            style={styles.templateCard}
            onPress={() => {
              setNewRoom({ name: 'Living Room', width: '15', depth: '12' });
            }}
          >
            <Text style={styles.templateIcon}>🛋️</Text>
            <Text style={styles.templateName}>Living Room</Text>
            <Text style={styles.templateSize}>15×12 ft</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.templateCard}
            onPress={() => {
              setNewRoom({ name: 'Bedroom', width: '12', depth: '10' });
            }}
          >
            <Text style={styles.templateIcon}>🛏️</Text>
            <Text style={styles.templateName}>Bedroom</Text>
            <Text style={styles.templateSize}>12×10 ft</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.templateCard}
            onPress={() => {
              setNewRoom({ name: 'Office', width: '10', depth: '8' });
            }}
          >
            <Text style={styles.templateIcon}>💼</Text>
            <Text style={styles.templateName}>Office</Text>
            <Text style={styles.templateSize}>10×8 ft</Text>
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
  section: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    fontSize: 16,
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 17,
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.primaryLighter + '10',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  roomDimensions: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  navigateButton: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 15,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLighter,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  noItemsText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    padding: theme.spacing.xl,
    fontSize: 15,
  },
  templatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  templateCard: {
    backgroundColor: theme.colors.primaryLighter,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
    ...theme.shadows.small,
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  templateName: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  templateSize: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default RoomCreationScreen;