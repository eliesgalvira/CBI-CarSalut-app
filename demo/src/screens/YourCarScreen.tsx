import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDemoState } from '../context/DemoStateContext';
import { DemoHeader, HealthBar, InfoGrid, ExpandableSection, DemoButton } from '../components';

export function YourCarScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state, selectedCar } = useDemoState();
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
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
        {/* Car Image and Condition */}
        <View style={styles.topSection}>
          <View style={styles.carImageContainer}>
            <Text style={styles.carEmoji}>🚗</Text>
          </View>
          
          <View style={styles.conditionContainer}>
            <Text style={styles.conditionLabel}>CONDITION</Text>
            <View style={styles.percentageRow}>
              <Text style={styles.percentage}>{Math.round(state.currentHealth)}</Text>
              <Text style={styles.percentageSymbol}>%</Text>
            </View>
          </View>
        </View>
        
        {/* Health Bar */}
        <View style={styles.healthBarContainer}>
          <HealthBar percentage={state.currentHealth} height={10} />
          <Text style={styles.lastSync}>LAST SYNC: {state.lastSyncDate}</Text>
        </View>
        
        {/* Verified History */}
        <Text style={styles.verifiedHistory}>
          VERIFIED HISTORY: {selectedCar.verifiedHistory}%
        </Text>
        
        {/* General Info */}
        <Text style={styles.sectionTitle}>GENERAL INFO</Text>
        <InfoGrid car={selectedCar} />
        
        {/* Expandable Sections */}
        <View style={styles.sectionsContainer}>
          <ExpandableSection
            title="MAINTENANCE HISTORY"
            expanded={expandedSections.maintenance}
            onToggle={() => toggleSection('maintenance')}
          >
            <View style={styles.historyItem}>
              <Text style={styles.historyDate}>15.10.2024</Text>
              <Text style={styles.historyType}>Oil Change</Text>
              <Text style={styles.historyGarage}>Taller Mecánico García</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyDate}>03.05.2024</Text>
              <Text style={styles.historyType}>Tire Rotation</Text>
              <Text style={styles.historyGarage}>AutoService Pro</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyDate}>28.12.2023</Text>
              <Text style={styles.historyType}>ITV Inspection</Text>
              <Text style={styles.historyGarage}>ITV Barcelona</Text>
            </View>
          </ExpandableSection>
          
          <ExpandableSection
            title="DRIVING HISTORY"
            expanded={expandedSections.driving}
            onToggle={() => toggleSection('driving')}
          >
            <View style={styles.drivingStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selectedCar.kilometers.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total KM</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.2</Text>
                <Text style={styles.statLabel}>Avg. Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Trips</Text>
              </View>
            </View>
          </ExpandableSection>
          
          <ExpandableSection
            title="RELATED GARAGES"
            expanded={expandedSections.garages}
            onToggle={() => toggleSection('garages')}
          >
            <View style={styles.garageItem}>
              <Text style={styles.garageName}>Taller Mecánico García</Text>
              <Text style={styles.garageAddress}>Carrer de Balmes 123, Barcelona</Text>
              <Text style={styles.garageRating}>⭐ 4.5 (128 reviews)</Text>
            </View>
            <View style={styles.garageItem}>
              <Text style={styles.garageName}>AutoService Pro</Text>
              <Text style={styles.garageAddress}>Av. Diagonal 456, Barcelona</Text>
              <Text style={styles.garageRating}>⭐ 4.8 (256 reviews)</Text>
            </View>
          </ExpandableSection>
        </View>
        
        {/* Transfer Car Button */}
        <DemoButton
          label="Transfer Car"
          onPress={() => {}}
          variant="primary"
          style={styles.transferButton}
        />
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
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  carImageContainer: {
    flex: 1,
  },
  carEmoji: {
    fontSize: 80,
  },
  conditionContainer: {
    alignItems: 'flex-end',
  },
  conditionLabel: {
    color: '#64748b',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 4,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  percentage: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '300',
  },
  percentageSymbol: {
    color: '#fff',
    fontSize: 18,
    marginTop: 8,
  },
  healthBarContainer: {
    marginBottom: 12,
  },
  lastSync: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  verifiedHistory: {
    color: '#94a3b8',
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionsContainer: {
    marginTop: 20,
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyDate: {
    color: '#64748b',
    fontSize: 11,
  },
  historyType: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  historyGarage: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  drivingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  garageItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  garageName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  garageAddress: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  garageRating: {
    color: '#F59E0B',
    fontSize: 12,
    marginTop: 4,
  },
  transferButton: {
    marginTop: 24,
  },
});
