import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDemoState } from '../context/DemoStateContext';
import { useNFC } from '../hooks/useNFC';
import { DemoHeader, HealthCircle, CarDropdown, DemoButton } from '../components';
import { NFC_TAG_TO_CAR } from '../data/carProfiles';

export function DemoHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state, selectedCar, cars, selectCar, selectCarByNFCTag, isInitialized, resetToUninitialized } = useDemoState();
  const { readTag, status: nfcStatus, error: nfcError } = useNFC();
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSyncToUpload = async () => {
    setSyncLoading(true);
    
    try {
      const tagContent = await readTag();
      
      if (tagContent) {
        const success = selectCarByNFCTag(tagContent);
        if (!success) {
          Alert.alert(
            'Unknown Tag',
            `Tag content "${tagContent}" is not recognized. Please use tag 1, 2, or 3.`,
            [{ text: 'OK' }]
          );
        }
      } else if (nfcError) {
        Alert.alert('NFC Error', nfcError, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('NFC read error:', error);
      Alert.alert('Error', 'Failed to read NFC tag. Please try again.', [{ text: 'OK' }]);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleReadCondition = () => {
    navigation.navigate('ConditionTab');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Demo',
      'This will reset the demo to uninitialized state. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetToUninitialized },
      ]
    );
  };

  // UNINITIALIZED STATE: Show gray placeholder circle and only "Sync to Upload" button
  if (!isInitialized) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <DemoHeader />
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Greeting */}
          <Text style={styles.greeting}>Hello Andreu</Text>
          
          {/* Placeholder - no car selected */}
          <Text style={styles.placeholderText}>Tap to sync your car</Text>
          
          {/* Gray placeholder circle */}
          <View style={styles.circleContainer}>
            <View style={styles.placeholderCircle}>
              <View style={styles.placeholderInner}>
                <Ionicons name="car-outline" size={64} color="#475569" />
                <Text style={styles.placeholderPercent}>--</Text>
              </View>
            </View>
          </View>
          
          {/* Only Sync to Upload button */}
          <View style={styles.buttonContainer}>
            <DemoButton
              label={nfcStatus === 'scanning' ? 'Waiting for NFC...' : 'Sync to Upload'}
              icon="wifi"
              onPress={handleSyncToUpload}
              loading={syncLoading || nfcStatus === 'scanning'}
              variant="primary"
            />
          </View>
          
          {/* NFC hint */}
          <Text style={styles.hintText}>
            Place your phone near the NFC tag{'\n'}
            (Tag 1 = Ibiza, Tag 2 = Formentor, Tag 3 = Leon)
          </Text>
        </ScrollView>
      </View>
    );
  }

  // INITIALIZED STATE: Show car dropdown, health circle, and only "Read Car's Condition"
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <DemoHeader />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Greeting */}
        <Text style={styles.greeting}>Hello Andreu</Text>
        
        {/* Car Dropdown */}
        {selectedCar && (
          <CarDropdown
            selectedCar={selectedCar}
            cars={cars}
            onSelect={selectCar}
          />
        )}
        
        {/* Health Circle */}
        <View style={styles.circleContainer}>
          <HealthCircle
            percentage={state.currentHealth}
            size={260}
            lastSync={state.lastSyncDate}
          />
          
          {/* Refresh icon */}
          <View style={styles.refreshIcon}>
            <Ionicons name="refresh-outline" size={24} color="#64748b" />
          </View>
        </View>
        
        {/* Only Read Car's Condition button (no Sync to Upload) */}
        <View style={styles.buttonContainer}>
          <View style={styles.conditionButtonContainer}>
            <DemoButton
              label="Read Car's Condition"
              icon="bluetooth"
              onPress={handleReadCondition}
              variant="secondary"
              style={styles.conditionButton}
            />
            {/* Notification badge */}
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>5</Text>
            </View>
          </View>
        </View>
        
        {/* Reset button for demo purposes */}
        <DemoButton
          label="Reset Demo"
          icon="refresh-outline"
          onPress={handleReset}
          variant="outline"
          style={styles.resetButton}
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
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: '300',
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  circleContainer: {
    marginVertical: 32,
    position: 'relative',
  },
  placeholderCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 12,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
  },
  placeholderInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderPercent: {
    fontSize: 48,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  refreshIcon: {
    position: 'absolute',
    right: -8,
    bottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  buttonSpacer: {
    height: 12,
  },
  conditionButtonContainer: {
    position: 'relative',
  },
  conditionButton: {
    width: '100%',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  hintText: {
    marginTop: 24,
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  resetButton: {
    marginTop: 24,
    width: '60%',
  },
});
