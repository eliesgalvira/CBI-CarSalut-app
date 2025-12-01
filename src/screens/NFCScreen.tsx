import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNFC } from '../hooks/useNFC';
import { ActionButton, StatusIndicator } from '../components';
import { NFCStatus } from '../types';

// Map NFC status to display text
const STATUS_TEXT: Record<NFCStatus, string> = {
  idle: 'Ready to Scan',
  checking: 'Checking NFC...',
  scanning: 'Waiting for Tag...',
  connected: 'Connected',
  writing: 'Writing to Tag...',
  error: 'Error',
};

// Map NFC status to StatusIndicator connection status
const statusToConnectionStatus = (nfcStatus: NFCStatus) => {
  switch (nfcStatus) {
    case 'idle':
      return 'idle';
    case 'checking':
      return 'preparing';
    case 'scanning':
      return 'scanning';
    case 'connected':
      return 'connected';
    case 'writing':
      return 'connecting';
    case 'error':
      return 'disconnected';
    default:
      return 'idle';
  }
};

export function NFCScreen() {
  const insets = useSafeAreaInsets();
  const {
    status,
    isSupported,
    isEnabled,
    tagInfo,
    lastMessage,
    error,
    startScan,
    stopScan,
    reset,
    requestPermissions,
  } = useNFC();

  // Check permissions on mount
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  const isScanning = status === 'scanning' || status === 'checking';
  const isConnected = status === 'connected';
  const isWriting = status === 'writing';
  const hasError = status === 'error';

  // Determine if we can scan
  const canScan = isSupported && isEnabled && !isScanning && !isWriting;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* Background decoration */}
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundCircle} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>NFC</Text>
        <Text style={styles.appSubtitle}>Tag Reader</Text>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <StatusIndicator status={statusToConnectionStatus(status)} />
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>{STATUS_TEXT[status]}</Text>
        </View>
      </View>

      {/* NFC Info Card */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          {/* Support Status */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NFC Supported</Text>
            <Text style={[styles.infoValue, isSupported ? styles.infoValueSuccess : styles.infoValueError]}>
              {isSupported ? 'Yes' : 'No'}
            </Text>
          </View>

          {/* Enabled Status */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NFC Enabled</Text>
            <Text style={[styles.infoValue, isEnabled ? styles.infoValueSuccess : styles.infoValueError]}>
              {isEnabled ? 'Yes' : 'No'}
            </Text>
          </View>

          {/* Tag ID (if connected) */}
          {tagInfo && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tag ID</Text>
              <Text style={styles.infoValue}>{tagInfo.id}</Text>
            </View>
          )}

          {/* Last Message (if written) */}
          {lastMessage && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Message</Text>
              <Text style={[styles.infoValue, styles.infoValueMessage]} numberOfLines={2}>
                {lastMessage}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!isConnected && !isWriting && (
          <ActionButton
            label={isScanning ? 'Cancel' : 'Scan for Tag'}
            onPress={() => {
              if (isScanning) {
                __DEV__ && console.log('[UI] Cancel NFC scan pressed');
                stopScan();
              } else {
                __DEV__ && console.log('[UI] Start NFC scan pressed');
                startScan();
              }
            }}
            variant={isScanning ? 'secondary' : 'primary'}
            loading={isScanning}
            disabled={!canScan && !isScanning}
          />
        )}

        {isWriting && (
          <ActionButton
            label="Writing..."
            onPress={() => {}}
            variant="secondary"
            loading
            disabled
          />
        )}

        {isConnected && (
          <ActionButton
            label="Reset"
            onPress={() => {
              __DEV__ && console.log('[UI] Reset NFC pressed');
              reset();
            }}
            variant="danger"
          />
        )}

        {hasError && (
          <ActionButton
            label="Try Again"
            onPress={() => {
              __DEV__ && console.log('[UI] Try again pressed');
              reset();
            }}
            variant="primary"
          />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isConnected
            ? 'Message written successfully!'
            : isScanning
            ? 'Hold your phone near an NFC tag'
            : 'Tap to scan for NFC tags'}
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
    backgroundColor: 'rgba(16, 185, 129, 0.05)', // Green tint for NFC
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
  statusTextContainer: {
    height: 20,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    minHeight: 200,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '500',
  },
  infoValueSuccess: {
    color: '#10b981',
  },
  infoValueError: {
    color: '#ef4444',
  },
  infoValueMessage: {
    color: '#a78bfa',
    maxWidth: '60%',
    textAlign: 'right',
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
