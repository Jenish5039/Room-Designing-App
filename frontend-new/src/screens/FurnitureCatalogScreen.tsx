import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { RootStackParamList, Furniture } from '../types';
import theme from '../theme/colors';

const API_BASE_URL = 'http://10.45.68.212:8000'; // ← Your IP

type FurnitureCatalogScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FurnitureCatalog'>;
type FurnitureCatalogScreenRouteProp = RouteProp<RootStackParamList, 'FurnitureCatalog'>;

interface Props {
  navigation: FurnitureCatalogScreenNavigationProp;
  route: FurnitureCatalogScreenRouteProp;
}

const FurnitureCatalogScreen: React.FC<Props> = ({ navigation, route }) => {
  const { onSelectFurniture } = route.params;
  const [furniture, setFurniture] = useState<Furniture[]>([]);
  const [filteredFurniture, setFilteredFurniture] = useState<Furniture[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'sofa' | 'table' | 'bed' | 'chair' | 'storage'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size'>('name');

  useEffect(() => {
    loadFurniture();
  }, []);

  useEffect(() => {
    filterAndSortFurniture();
  }, [furniture, searchQuery, activeCategory, sortBy]);

  const loadFurniture = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/furniture`);
      setFurniture(response.data);
    } catch (error) {
      console.error('Error loading furniture:', error);
    }
  };

  const filterAndSortFurniture = () => {
    let filtered = furniture;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.type === activeCategory);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        const areaA = a.width * a.depth;
        const areaB = b.width * b.depth;
        return areaA - areaB;
      }
    });

    setFilteredFurniture(filtered);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sofa': return '🛋️';
      case 'table': return '🪑';
      case 'bed': return '🛏️';
      case 'chair': return '💺';
      case 'storage': return '📚';
      default: return '📦';
    }
  };

  const categories = [
    { key: 'all', name: 'All', icon: '📦' },
    { key: 'sofa', name: 'Sofas', icon: '🛋️' },
    { key: 'table', name: 'Tables', icon: '🪑' },
    { key: 'bed', name: 'Beds', icon: '🛏️' },
    { key: 'chair', name: 'Chairs', icon: '💺' },
    { key: 'storage', name: 'Storage', icon: '📚' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>🛋️ Furniture Catalog</Text>
          <Text style={styles.subtitle}>{filteredFurniture.length} items available</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search furniture..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity 
          style={[styles.sortOption, sortBy === 'name' && styles.activeSortOption]}
          onPress={() => setSortBy('name')}
        >
          <Text style={[styles.sortText, sortBy === 'name' && styles.activeSortText]}>
            Name
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortOption, sortBy === 'size' && styles.activeSortOption]}
          onPress={() => setSortBy('size')}
        >
          <Text style={[styles.sortText, sortBy === 'size' && styles.activeSortText]}>
            Size
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryChip,
              activeCategory === category.key && styles.activeCategoryChip
            ]}
            onPress={() => setActiveCategory(category.key as any)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              activeCategory === category.key && styles.activeCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Furniture Grid */}
      <ScrollView style={styles.furnitureGridContainer}>
        {filteredFurniture.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No furniture found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : 'Try changing your filters or search terms'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.furnitureGrid}>
            {filteredFurniture.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.furnitureCard}
                onPress={() => {
                  onSelectFurniture(item);
                  navigation.goBack();
                }}
              >
                <View style={styles.furnitureIcon}>
                  <Text style={styles.furnitureIconText}>
                    {getCategoryIcon(item.type)}
                  </Text>
                </View>
                
                <View style={styles.furnitureInfo}>
                  <Text style={styles.furnitureName}>{item.name}</Text>
                  <Text style={styles.furnitureType}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                  <Text style={styles.furnitureDimensions}>
                    {item.width}ft × {item.depth}ft
                  </Text>
                  <Text style={styles.furnitureArea}>
                    Area: {(item.width * item.depth).toFixed(1)} sq ft
                  </Text>
                </View>

                <View style={styles.furnitureActions}>
                  <TouchableOpacity 
                    style={styles.selectButton}
                    onPress={() => {
                      onSelectFurniture(item);
                      navigation.goBack();
                    }}
                  >
                    <Text style={styles.selectButtonText}>Select</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{furniture.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {furniture.filter(item => item.type === 'sofa').length}
          </Text>
          <Text style={styles.statLabel}>Sofas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {furniture.filter(item => item.type === 'table').length}
          </Text>
          <Text style={styles.statLabel}>Tables</Text>
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
  searchContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.divider,
    ...theme.shadows.small,
  },
  searchInput: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.divider,
  },
  sortLabel: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
    fontWeight: '500',
  },
  sortOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
  },
  activeSortOption: {
    backgroundColor: theme.colors.primary,
  },
  sortText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeSortText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.divider,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLighter,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.xs,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  activeCategoryChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: theme.colors.white,
  },
  furnitureGridContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
  },
  emptyStateIcon: {
    fontSize: 56,
    marginBottom: theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  furnitureGrid: {
    // Furniture cards will stack vertically
  },
  furnitureCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.medium,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  furnitureIcon: {
    width: 56,
    height: 56,
    backgroundColor: theme.colors.primaryLighter,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  furnitureIconText: {
    fontSize: 24,
  },
  furnitureInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  furnitureName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  furnitureType: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  furnitureDimensions: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  furnitureArea: {
    fontSize: 13,
    color: theme.colors.textLight,
  },
  furnitureActions: {
    justifyContent: 'center',
  },
  selectButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  selectButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderTopWidth: 2,
    borderTopColor: theme.colors.divider,
    ...theme.shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default FurnitureCatalogScreen;