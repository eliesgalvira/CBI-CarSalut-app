import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBLE } from './src/hooks/useBLE';
import {
  StatusIndicator,
  BatteryIndicator,
  ActionButton,
} from './src/components';

// Store for last received battery percentage (will be moved to Convex DB later)
let lastReceivedBatteryPercentage: number | null = null;
let lastReceivedTimestamp: Date | null = null;

function AppContent() {
  const insets = useSafeAreaInsets();
  const {
    status,
    deviceName,
    heartbeat,
    error,
    startScan,
    stopScan,
    disconnect,
    requestPermissions,
  } = useBLE();

  // Local state for battery percentage and timestamp
  const [batteryPercentage, setBatteryPercentage] = useState<number | null>(lastReceivedBatteryPercentage);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(lastReceivedTimestamp);

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  // Update battery percentage when heartbeat changes
  useEffect(() => {
    if (heartbeat?.counter !== undefined && heartbeat.counter !== null) {
      const newPercentage = heartbeat.counter;
      const newTimestamp = heartbeat.timestamp;
      
      setBatteryPercentage(newPercentage);
      setLastUpdated(newTimestamp);
      
      // Store in module-level variables (will be Convex DB later)
      lastReceivedBatteryPercentage = newPercentage;
      lastReceivedTimestamp = newTimestamp;
    }
  }, [heartbeat?.counter, heartbeat?.timestamp]);

  const isScanning = status === 'scanning' || status === 'preparing';
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* Background decoration */}
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundCircle} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>CarTag</Text>
        <Text style={styles.appSubtitle}>BLE Monitor</Text>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <StatusIndicator status={status} />
        {/* Always render device name container to prevent layout shift */}
        <View style={styles.deviceNameContainer}>
          <Text style={styles.deviceName}>
            {deviceName || ' '}
          </Text>
        </View>
      </View>

      {/* Battery Indicator */}
      <View style={styles.batterySection}>
        <BatteryIndicator percentage={batteryPercentage} lastUpdated={lastUpdated} />
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!isConnected && !isConnecting && (
          <ActionButton
            label={isScanning ? 'Stop Scan' : 'Scan for Device'}
            onPress={() => {
              if (isScanning) {
                console.log('[UI] Stop Scan button pressed');
                stopScan();
              } else {
                console.log('[UI] Scan button pressed');
                startScan();
              }
            }}
            variant={isScanning ? 'secondary' : 'primary'}
            loading={isScanning}
          />
        )}

        {isConnecting && (
          <ActionButton
            label="Connecting..."
            onPress={() => {}}
            variant="secondary"
            loading
            disabled
          />
        )}

        {isConnected && (
          <ActionButton
            label="Disconnect"
            onPress={() => {
              console.log('[UI] Disconnect button pressed');
              disconnect();
            }}
            variant="danger"
          />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isConnected
            ? 'Receiving data from CarTag'
            : 'Make sure your CarTag device is powered on'}
        </Text>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    backgroundColor: '#0a0a0f',
    opacity: 0.8,
  },
  backgroundCircle: {
    position: 'absolute',
    top: -150,
    right: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#f8fafc',
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusContainer: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  deviceNameContainer: {
    height: 20, // Fixed height to prevent layout shift
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  batterySection: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 250,
  },
  errorContainer: {
    marginHorizontal: 32,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },
});

