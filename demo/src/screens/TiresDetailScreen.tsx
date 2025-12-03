import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, DemoButton } from '../components';
import { useDemoState } from '../context/DemoStateContext';
import { MAINTENANCE_GUIDES } from '../data/carProfiles';

export function TiresDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { selectedCar, performSync } = useDemoState();
  const [syncLoading, setSyncLoading] = useState(false);

  const guide = MAINTENANCE_GUIDES.tires;

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
          <Ionicons name="ellipse-outline" size={24} color="#fff" />
          <Text style={styles.title}>{guide.title}</Text>
        </View>
        
        {/* Warning Bar */}
        <View style={styles.warningBar}>
          <Text style={styles.warningText}>
            <Text style={styles.warningDot}>● </Text>
            Check air pressure
          </Text>
        </View>
        
        {/* Recommendation */}
        <Text style={styles.recommendation}>
          TIRE PRESSURE FOR YOUR {selectedCar.brand} {selectedCar.model.toUpperCase()} SHOULD BE CHECKED {guide.interval.toUpperCase()}
        </Text>
        
        {/* Tire Pressure Info */}
        <View style={styles.pressureInfo}>
          <Text style={styles.pressureTitle}>Recommended Pressure</Text>
          <View style={styles.pressureGrid}>
            <View style={styles.pressureItem}>
              <Text style={styles.pressureLabel}>Front</Text>
              <Text style={styles.pressureValue}>2.3 bar</Text>
            </View>
            <View style={styles.pressureItem}>
              <Text style={styles.pressureLabel}>Rear</Text>
              <Text style={styles.pressureValue}>2.1 bar</Text>
            </View>
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
              <Text style={styles.stepText}>1. Check tire pressure when tires are cold (before driving)</Text>
              <Text style={styles.stepText}>2. Remove valve cap and attach pressure gauge</Text>
              <Text style={styles.stepText}>3. Compare reading to recommended pressure (door jamb sticker)</Text>
              <Text style={styles.stepText}>4. Add or release air as needed</Text>
              <Text style={styles.stepText}>5. Check tread depth - minimum 1.6mm legal limit</Text>
              <Text style={styles.stepText}>6. Look for uneven wear patterns</Text>
            </View>
          </View>
          
          <View style={styles.garageCard}>
            <Text style={styles.cardTitle}>FIND A GARAGE</Text>
            <Text style={styles.cardDescription}>
              For tire rotation, balancing, or replacement, visit a certified tire center.
            </Text>
            <View style={styles.garageList}>
              <View style={styles.garageItem}>
                <Text style={styles.garageName}>Michelin Center Barcelona</Text>
                <Text style={styles.garageDistance}>1.2 km away</Text>
              </View>
              <View style={styles.garageItem}>
                <Text style={styles.garageName}>Norauto</Text>
                <Text style={styles.garageDistance}>3.5 km away</Text>
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
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    color: '#F59E0B',
    fontSize: 13,
  },
  warningDot: {
    color: '#F59E0B',
  },
  recommendation: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  pressureInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  pressureTitle: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pressureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pressureItem: {
    alignItems: 'center',
  },
  pressureLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  pressureValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
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
    gap: 8,
  },
  stepText: {
    color: '#4a4a4a',
    fontSize: 12,
    lineHeight: 18,
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
