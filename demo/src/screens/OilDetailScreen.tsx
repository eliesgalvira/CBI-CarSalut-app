import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, DemoButton, ActionCard } from '../components';
import { useDemoState } from '../context/DemoStateContext';
import { MAINTENANCE_GUIDES } from '../data/carProfiles';

export function OilDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { selectedCar, performSync, state } = useDemoState();
  const [syncLoading, setSyncLoading] = useState(false);

  const guide = MAINTENANCE_GUIDES.oil;

  const handleSync = async () => {
    setSyncLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = performSync();
    setSyncLoading(false);

    if (result === 'reset') {
      Alert.alert('Sync Complete', 'Demo cycle complete! Returning to home.', [
        { text: 'OK', onPress: () => navigation.navigate('HomeTab') }
      ]);
    } else if (result === 'increased') {
      Alert.alert('Sync Complete', 'Car condition improved by 5%! 🎉');
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
          <Ionicons name="water" size={24} color="#fff" />
          <Text style={styles.title}>{guide.title}</Text>
        </View>
        
        {/* Warning Bar */}
        <View style={styles.warningBar}>
          <Text style={styles.warningText}>
            <Text style={styles.warningDot}>● </Text>
            No register of last oil check
          </Text>
        </View>
        
        {/* Recommendation */}
        <Text style={styles.recommendation}>
          OIL SHOULD BE CHANGED ON YOUR {selectedCar.year} {selectedCar.brand} {selectedCar.model.toUpperCase()} EVERY 12 MONTHS OR 10,000 MILES
        </Text>
        
        {/* Action Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.guideCard}>
            <Text style={styles.cardTitle}>GUIDE</Text>
            <Text style={styles.cardDescription}>
              {guide.recommendation}
            </Text>
            <View style={styles.cardSteps}>
              <Text style={styles.stepText}>1. Park on a level surface and warm up the engine</Text>
              <Text style={styles.stepText}>2. Locate the oil dipstick and remove it</Text>
              <Text style={styles.stepText}>3. Wipe clean and reinsert fully</Text>
              <Text style={styles.stepText}>4. Remove again and check the level</Text>
              <Text style={styles.stepText}>5. Oil should be between MIN and MAX marks</Text>
            </View>
          </View>
          
          <View style={styles.garageCard}>
            <Text style={styles.cardTitle}>FIND A GARAGE</Text>
            <Text style={styles.cardDescription}>
              We recommend getting your oil changed at a certified garage for your {selectedCar.brand}.
            </Text>
            <View style={styles.garageList}>
              <View style={styles.garageItem}>
                <Text style={styles.garageName}>Taller Mecánico García</Text>
                <Text style={styles.garageDistance}>2.3 km away</Text>
              </View>
              <View style={styles.garageItem}>
                <Text style={styles.garageName}>AutoService Pro</Text>
                <Text style={styles.garageDistance}>3.8 km away</Text>
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
