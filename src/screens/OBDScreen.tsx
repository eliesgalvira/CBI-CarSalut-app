import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOBD } from '../hooks/useOBD';
import { StatusIndicator, ActionButton } from '../components';
import { OBDGauge } from '../components/OBDGauge';

export function OBDScreen() {
  const insets = useSafeAreaInsets();
  const {
    status,
    deviceName,
    obdData,
    error,
    isPolling,
    startScan,
    stopScan,
    disconnect,
    requestPermissions,
  } = useOBD();

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  const isScanning = status === 'scanning' || status === 'preparing';
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  // Format last updated time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* Background decoration */}
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundCircle} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>OBD-II</Text>
        <Text style={styles.appSubtitle}>Vehicle Diagnostics</Text>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <StatusIndicator status={status} />
        <View style={styles.deviceNameContainer}>
          <Text style={styles.deviceName}>{deviceName || ' '}</Text>
        </View>
        {isPolling && (
          <View style={styles.pollingIndicator}>
            <View style={styles.pollingDot} />
            <Text style={styles.pollingText}>Live Data</Text>
          </View>
        )}
      </View>

      {/* OBD Gauges - 2x2 Grid */}
      <View style={styles.gaugesSection}>
        <View style={styles.gaugesGrid}>
          <View style={styles.gaugeRow}>
            <OBDGauge
              value={obdData?.rpm ?? null}
              type="rpm"
              label="RPM"
              unit="rpm"
              size={160}
            />
            <OBDGauge
              value={obdData?.speed ?? null}
              type="speed"
              label="Speed"
              unit="km/h"
              size={160}
            />
          </View>
          <View style={styles.gaugeRow}>
            <OBDGauge
              value={obdData?.coolantTemp ?? null}
              type="temperature"
              label="Coolant"
              unit="°C"
              size={160}
            />
            <OBDGauge
              value={obdData?.engineLoad ?? null}
              type="percentage"
              label="Load"
              unit="%"
              size={160}
            />
          </View>
        </View>

        {/* Last Updated */}
        {obdData?.timestamp && (
          <View style={styles.lastUpdatedContainer}>
            <Text style={styles.lastUpdatedLabel}>LAST UPDATED</Text>
            <Text style={styles.lastUpdatedValue}>{formatTime(obdData.timestamp)}</Text>
          </View>
        )}
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
                __DEV__ && console.log('[OBD UI] Stop Scan button pressed');
                stopScan();
              } else {
                __DEV__ && console.log('[OBD UI] Scan button pressed');
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
              __DEV__ && console.log('[OBD UI] Disconnect button pressed');
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
            ? 'Receiving OBD-II data from CarTag'
            : 'Make sure your OBD device is powered on'}
        </Text>
      </View>
    </View>
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
    paddingTop: 20,
    paddingBottom: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#f8fafc',
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  deviceNameContainer: {
    height: 18,
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  pollingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
  },
  pollingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  pollingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gaugesSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  gaugesGrid: {
    gap: 8,
  },
  gaugeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  lastUpdatedContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  lastUpdatedLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 2,
  },
  lastUpdatedValue: {
    fontSize: 12,
    color: '#94a3b8',
    fontVariant: ['tabular-nums'],
  },
  errorContainer: {
    marginHorizontal: 32,
    padding: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
  },
});
