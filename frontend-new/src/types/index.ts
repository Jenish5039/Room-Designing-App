export interface Room {
  id: number;
  name: string;
  width: number;
  depth: number;
}

export interface Furniture {
  id: number;
  name: string;
  type: string;
  width: number;
  depth: number;
}

export interface PlacedFurniture {
  id: number;
  furniture: Furniture;
  position: { x: number; y: number };
  rotation: number;
}

export interface Design {
  id: number;
  name: string;
  room_id: number;
  furniture_items: PlacedFurniture[];
  created_at?: string;
}

export type RootStackParamList = {
  Home: undefined;
  RoomCreation: undefined;
  DesignStudio: { room: Room };
  SavedDesigns: undefined;
  FurnitureCatalog: { onSelectFurniture: (furniture: Furniture) => void };
};