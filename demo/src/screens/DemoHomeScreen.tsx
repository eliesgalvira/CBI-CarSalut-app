import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDemoState } from '../context/DemoStateContext';
import { DemoHeader, HealthCircle, CarDropdown, DemoButton } from '../components';

export function DemoHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state, selectedCar, cars, selectCar, performSync } = useDemoState();
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSync = async () => {
    setSyncLoading(true);
    
    // Simulate NFC read delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = performSync();
    setSyncLoading(false);

    if (result === 'reset') {
      Alert.alert('Sync Complete', 'Demo cycle complete! Starting over.', [
        { text: 'OK' }
      ]);
    } else if (result === 'decreased') {
      Alert.alert('Sync Complete', 'Car condition decreased by 2%', [
        { text: 'View Condition', onPress: () => navigation.navigate('ConditionTab') }
      ]);
    } else if (result === 'increased') {
      Alert.alert('Sync Complete', 'Car condition improved by 5%! 🎉', [
        { text: 'View Condition', onPress: () => navigation.navigate('ConditionTab') }
      ]);
    } else {
      // First sync - just go to condition
      navigation.navigate('ConditionTab');
    }
  };

  const handleReadCondition = () => {
    navigation.navigate('ConditionTab');
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <DemoHeader />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Greeting */}
        <Text style={styles.greeting}>Hello Andreu</Text>
        
        {/* Car Dropdown */}
        <CarDropdown
          selectedCar={selectedCar}
          cars={cars}
          onSelect={selectCar}
        />
        
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
        
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <DemoButton
            label="Sync to Upload"
            icon="wifi"
            onPress={handleSync}
            loading={syncLoading}
            variant="primary"
          />
          
          <View style={styles.buttonSpacer} />
          
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
        
        {/* Sync count indicator (for demo) */}
        <Text style={styles.syncIndicator}>
          Sync cycle: {state.syncCount}/4
        </Text>
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
  circleContainer: {
    marginVertical: 32,
    position: 'relative',
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
  syncIndicator: {
    marginTop: 24,
    color: '#64748b',
    fontSize: 12,
  },
});
