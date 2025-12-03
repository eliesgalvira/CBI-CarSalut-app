import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, DemoButton } from '../components';
import { useDemoState } from '../context/DemoStateContext';
import { MAINTENANCE_GUIDES } from '../data/carProfiles';

export function WaterPumpDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { selectedCar, performSync } = useDemoState();
  const [syncLoading, setSyncLoading] = useState(false);

  const guide = MAINTENANCE_GUIDES.waterPump;

  const handleSync = async () => {
    setSyncLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = performSync();
    setSyncLoading(false);

    if (result === 'reset') {
      Alert.alert('Sync Complete', 'Demo cycle complete! Returning to home.', [
        { text: 'OK', onPress: () => navigation.navigate('HomeTab') }
      ]);
    } else {
      Alert.alert('Sync Complete', 'Data synced successfully');
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <DemoHeader
        showBack
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Title with Icon */}
        <View style={styles.titleRow}>
          <Ionicons name="cog-outline" size={24} color="#fff" />
          <Text style={styles.title}>{guide.title}</Text>
        </View>
        
        {/* Warning Bar */}
        <View style={styles.warningBar}>
          <Text style={styles.warningText}>
            <Text style={styles.warningDot}>● </Text>
            Over 20,000km since last inspection
          </Text>
        </View>
        
        {/* Recommendation */}
        <Text style={styles.recommendation}>
          THE WATER PUMP ON YOUR {selectedCar.brand} {selectedCar.model.toUpperCase()} SHOULD BE INSPECTED {guide.interval.toUpperCase()}
        </Text>
        
        {/* Status Info */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current Mileage</Text>
            <Text style={styles.statusValue}>{selectedCar.kilometers.toLocaleString()} km</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last Inspection</Text>
            <Text style={styles.statusValue}>N/A</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Typical Lifespan</Text>
            <Text style={styles.statusValue}>60,000 - 100,000 km</Text>
          </View>
        </View>
        
        {/* Action Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.guideCard}>
            <Text style={styles.cardTitle}>GUIDE</Text>
            <Text style={styles.cardDescription}>
              {guide.recommendation}
            </Text>
            <View style={styles.cardSteps}>
              <Text style={styles.stepTitle}>Signs of water pump failure:</Text>
              <Text style={styles.stepText}>• Coolant leaks under the vehicle</Text>
              <Text style={styles.stepText}>• Whining or grinding noise from the engine</Text>
              <Text style={styles.stepText}>• Engine overheating</Text>
              <Text style={styles.stepText}>• Steam coming from the radiator</Text>
              <Text style={styles.stepText}>• Coolant smell inside the car</Text>
              
              <Text style={[styles.stepTitle, { marginTop: 12 }]}>Preventive measures:</Text>
              <Text style={styles.stepText}>• Replace water pump with timing belt (same labor)</Text>
              <Text style={styles.stepText}>• Use manufacturer-recommended coolant</Text>
              <Text style={styles.stepText}>• Regular coolant system inspections</Text>
            </View>
          </View>
          
          <View style={styles.garageCard}>
            <Text style={styles.cardTitle}>FIND A GARAGE</Text>
            <Text style={styles.cardDescription}>
              Water pump replacement requires professional service. We recommend certified mechanics for this repair.
            </Text>
            <View style={styles.costInfo}>
              <Text style={styles.costLabel}>Estimated Cost Range</Text>
              <Text style={styles.costValue}>€250 - €500</Text>
              <Text style={styles.costNote}>Parts + Labor</Text>
            </View>
            <View style={styles.garageList}>
              <View style={styles.garageItem}>
                <Text style={styles.garageName}>{selectedCar.brand} Official Service</Text>
                <Text style={styles.garageDistance}>2.1 km away</Text>
              </View>
              <View style={styles.garageItem}>
                <Text style={styles.garageName}>MecaniCar Pro</Text>
                <Text style={styles.garageDistance}>3.4 km away</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <DemoButton
            label="Upload Update"
            icon="add-circle-outline"
            onPress={() => Alert.alert('Upload', 'This would open the upload dialog')}
            variant="outline"
          />
          
          <View style={styles.buttonSpacer} />
          
          <DemoButton
            label="Sync Now"
            icon="wifi"
            onPress={handleSync}
            loading={syncLoading}
            variant="primary"
          />
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  warningBar: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    color: '#EF4444',
    fontSize: 13,
  },
  warningDot: {
    color: '#EF4444',
  },
  recommendation: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  statusValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  guideCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 20,
  },
  garageCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    color: '#4a4a4a',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardSteps: {
    gap: 6,
  },
  stepTitle: {
    color: '#1a1a1a',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepText: {
    color: '#4a4a4a',
    fontSize: 12,
    lineHeight: 18,
  },
  costInfo: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  costLabel: {
    color: '#4a4a4a',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  costValue: {
    color: '#166534',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  costNote: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  garageList: {
    gap: 12,
  },
  garageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  garageName: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  garageDistance: {
    color: '#64748b',
    fontSize: 12,
  },
  buttonsContainer: {
    gap: 12,
  },
  buttonSpacer: {
    height: 4,
  },
});
