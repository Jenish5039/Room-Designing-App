import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import RoomCreationScreen from './src/screens/RoomCreationScreen';
import DesignStudioScreen from './src/screens/DesignStudioScreen';
import SavedDesignsScreen from './src/screens/SavedDesignsScreen';
import FurnitureCatalogScreen from './src/screens/FurnitureCatalogScreen';
import theme from './src/theme/colors';

export type RootStackParamList = {
  Home: undefined;
  RoomCreation: undefined;
  DesignStudio: { room: any };
  SavedDesigns: undefined;
  FurnitureCatalog: { onSelectFurniture: (furniture: any) => void };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
          animationEnabled: true,
          gestureEnabled: true,
          animationTypeForReplace: 'push',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RoomCreation" component={RoomCreationScreen} />
        <Stack.Screen name="DesignStudio" component={DesignStudioScreen} />
        <Stack.Screen name="SavedDesigns" component={SavedDesignsScreen} />
        <Stack.Screen name="FurnitureCatalog" component={FurnitureCatalogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}