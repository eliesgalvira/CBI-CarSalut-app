import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, DemoButton } from '../components';
import { useDemoState } from '../context/DemoStateContext';
import { MAINTENANCE_GUIDES } from '../data/carProfiles';

export function MandatoryChecksScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { selectedCar, performSync } = useDemoState();
  const [syncLoading, setSyncLoading] = useState(false);

  const guide = MAINTENANCE_GUIDES.mandatoryChecks;

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

  // Calculate next ITV date based on car registration
  const carYear = selectedCar.year;
  const vehicleAge = 2025 - carYear;
  const itvFrequency = vehicleAge >= 10 ? 'annually' : vehicleAge >= 4 ? 'every 2 years' : 'every 4 years';

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <DemoHeader
        showBack
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Title with Icon */}
        <View style={styles.titleRow}>
          <Ionicons name="document-text-outline" size={24} color="#fff" />
          <Text style={styles.title}>{guide.title}</Text>
        </View>
        
        {/* Warning Bar */}
        <View style={styles.warningBar}>
          <Text style={styles.warningText}>
            <Text style={styles.warningDot}>● </Text>
            ITV expired
          </Text>
        </View>
        
        {/* Recommendation */}
        <Text style={styles.recommendation}>
          YOUR {selectedCar.brand} {selectedCar.model.toUpperCase()} ({carYear}) REQUIRES ITV INSPECTION {itvFrequency.toUpperCase()}
        </Text>
        
        {/* ITV Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last ITV</Text>
            <Text style={styles.statusValue}>28.12.2023</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>EXPIRED</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Vehicle Age</Text>
            <Text style={styles.statusValue}>{vehicleAge} years</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Required Frequency</Text>
            <Text style={styles.statusValue}>{itvFrequency}</Text>
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
              <Text style={styles.stepTitle}>What to bring:</Text>
              <Text style={styles.stepText}>• Vehicle registration document (permiso de circulación)</Text>
              <Text style={styles.stepText}>• Technical inspection card (tarjeta ITV)</Text>
              <Text style={styles.stepText}>• Valid insurance certificate</Text>
              <Text style={styles.stepText}>• Previous ITV report (if applicable)</Text>
              
              <Text style={[styles.stepTitle, { marginTop: 12 }]}>What they check:</Text>
              <Text style={styles.stepText}>• Brakes and suspension</Text>
              <Text style={styles.stepText}>• Lights and signals</Text>
              <Text style={styles.stepText}>• Emissions</Text>
              <Text style={styles.stepText}>• Steering and chassis</Text>
              <Text style={styles.stepText}>• Tires and wheels</Text>
            </View>
          </View>
          
          <View style={styles.garageCard}>
            <Text style={styles.cardTitle}>FIND AN ITV STATION</Text>
            <Text style={styles.cardDescription}>
              Book your ITV inspection at an authorized station. Appointments are recommended.
            </Text>
            <View style={styles.garageList}>
              <View style={styles.garageItem}>
                <Text style={styles.garageName}>ITV Barcelona - Zona Franca</Text>
                <Text style={styles.garageDistance}>4.2 km away</Text>
              </View>
              <View style={styles.garageItem}>
                <Text style={styles.garageName}>ITV Badalona</Text>
                <Text style={styles.garageDistance}>6.8 km away</Text>
              </View>
              <View style={styles.garageItem}>
                <Text style={styles.garageName}>ITV L'Hospitalet</Text>
                <Text style={styles.garageDistance}>5.1 km away</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Fine Warning */}
        <View style={styles.fineWarning}>
          <Ionicons name="warning" size={20} color="#EF4444" />
          <Text style={styles.fineText}>
            Driving with an expired ITV can result in fines up to €500 and vehicle immobilization.
          </Text>
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
    fontSize: 18,
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
  expiredBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 16,
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
  fineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  fineText: {
    color: '#fca5a5',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  buttonsContainer: {
    gap: 12,
  },
  buttonSpacer: {
    height: 4,
  },
});
