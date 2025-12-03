import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDemoState } from '../context/DemoStateContext';
import { DemoHeader, HealthBar, ImprovementCard } from '../components';
import { getMaintenanceItems } from '../data/carProfiles';

const IMPROVEMENT_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'recommended', label: 'Recommended' },
];

export function ConditionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state, selectedCar } = useDemoState();
  const [filterType, setFilterType] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const maintenanceItems = getMaintenanceItems(state.metrics);
  
  const filteredItems = filterType === 'all' 
    ? maintenanceItems 
    : filterType === 'urgent'
    ? maintenanceItems.filter(item => item.warningLevel === 'red')
    : maintenanceItems.filter(item => item.warningLevel === 'yellow');

  const handleItemPress = (itemId: string) => {
    // Navigate to detail screen based on item type
    switch (itemId) {
      case 'oil':
        navigation.navigate('OilDetail');
        break;
      case 'water':
        navigation.navigate('WaterDetail');
        break;
      case 'tires':
        navigation.navigate('TiresDetail');
        break;
      case 'mandatoryChecks':
        navigation.navigate('MandatoryChecksDetail');
        break;
      case 'waterPump':
        navigation.navigate('WaterPumpDetail');
        break;
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <DemoHeader
        showBack
        onBack={() => navigation.goBack()}
        showCarDropdown
        carName={selectedCar.name}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Title */}
        <Text style={styles.title}>IMPROVE CAR'S CONDITION</Text>
        
        {/* Car Image with Bluetooth */}
        <View style={styles.carSection}>
          <View style={styles.carImageContainer}>
            <Text style={styles.carEmoji}>🚗</Text>
            <View style={styles.bluetoothIcon}>
              <Ionicons name="bluetooth" size={20} color="#fff" />
            </View>
          </View>
          
          <View style={styles.percentageContainer}>
            <Text style={styles.percentage}>{Math.round(state.currentHealth)}</Text>
            <Text style={styles.percentageSymbol}>%</Text>
          </View>
        </View>
        
        {/* Health Bar */}
        <View style={styles.healthBarContainer}>
          <HealthBar percentage={state.currentHealth} height={12} />
          <Text style={styles.lastSync}>LAST SYNC: {state.lastSyncDate}</Text>
        </View>
        
        {/* Filter Dropdown */}
        <TouchableOpacity 
          style={styles.filterDropdown}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Text style={styles.filterText}>
            {IMPROVEMENT_TYPES.find(t => t.id === filterType)?.label || 'IMPROVEMENT TYPE'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#fff" />
        </TouchableOpacity>
        
        {showFilter && (
          <View style={styles.filterOptions}>
            {IMPROVEMENT_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.filterOption,
                  filterType === type.id && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setFilterType(type.id);
                  setShowFilter(false);
                }}
              >
                <Text style={styles.filterOptionText}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Improvement Cards */}
        <View style={styles.itemsContainer}>
          {filteredItems.map(item => (
            <ImprovementCard
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item.id)}
            />
          ))}
          
          {filteredItems.length === 0 && (
            <Text style={styles.emptyText}>No items match the selected filter</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    color: '#94a3b8',
    fontSize: 14,
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 16,
  },
  carSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  carImageContainer: {
    position: 'relative',
  },
  carEmoji: {
    fontSize: 80,
  },
  bluetoothIcon: {
    position: 'absolute',
    top: -8,
    right: -16,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 20,
  },
  percentage: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '300',
  },
  percentageSymbol: {
    color: '#fff',
    fontSize: 20,
    marginTop: 8,
  },
  healthBarContainer: {
    marginBottom: 20,
  },
  lastSync: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  filterText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  filterOptions: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  filterOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterOptionSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  filterOptionText: {
    color: '#fff',
    fontSize: 14,
  },
  itemsContainer: {
    flex: 1,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 32,
  },
});
