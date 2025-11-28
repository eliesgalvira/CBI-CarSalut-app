import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useBLE } from './src/hooks/useBLE';
import {
  StatusIndicator,
  CounterDisplay,
  ActionButton,
  ServiceList,
} from './src/components';

export default function App() {
  const {
    status,
    deviceName,
    heartbeat,
    error,
    services,
    selectedCharacteristic,
    startScan,
    stopScan,
    disconnect,
    selectCharacteristic,
    requestPermissions,
  } = useBLE();

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  const isScanning = status === 'scanning';
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* Background decoration */}
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundCircle} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>CarSalut</Text>
        <Text style={styles.appSubtitle}>BLE Heartbeat Monitor</Text>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <StatusIndicator status={status} />
        {deviceName && (
          <Text style={styles.deviceName}>{deviceName}</Text>
        )}
      </View>

      {/* Counter Display */}
      <View style={styles.counterSection}>
        <CounterDisplay heartbeat={heartbeat} />
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Service List (when connected) */}
      {isConnected && (
        <ServiceList
          services={services}
          selectedCharacteristic={selectedCharacteristic}
          onSelectCharacteristic={selectCharacteristic}
        />
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!isConnected && !isConnecting && (
          <ActionButton
            label={isScanning ? 'Stop Scan' : 'Scan for Device'}
            onPress={isScanning ? stopScan : startScan}
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
            onPress={disconnect}
            variant="danger"
          />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isConnected
            ? 'Tap a characteristic with [N] to switch data source'
            : 'Make sure your CarSalut device is powered on'}
        </Text>
      </View>
    </SafeAreaView>
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
  deviceName: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  counterSection: {
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

