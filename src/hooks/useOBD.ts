import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import {
  BleManager,
  Device,
  Characteristic,
  State,
  BleError,
  ScanMode,
} from 'react-native-ble-plx';
import { ConnectionStatus, OBDData, OBDState } from '../types';

// ========== Configuration ==========
// Adjust this value to change how often OBD data is polled (in milliseconds)
const POLLING_INTERVAL = 500; // ms between each OBD command cycle

const TARGET_DEVICE_NAME = 'CarTag';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const SCAN_TIMEOUT = 15000;
const MAX_SCAN_RETRIES = 3;
const CONNECTION_TIMEOUT = 10000;
const COMMAND_DELAY = 150; // Delay between commands to let ESP32 process

// Nordic UART Service UUIDs (matching ESP32 firmware) - lowercase for react-native-ble-plx
const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_RX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // Write (Phone -> ESP32)
const NUS_TX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Notify (ESP32 -> Phone)

// OBD-II PID Commands
const OBD_COMMANDS = {
  RPM: '010C\r',
  SPEED: '010D\r',
  COOLANT_TEMP: '0105\r',
  ENGINE_LOAD: '0104\r',
} as const;

// Logging helper
const log = {
  debug: (...args: unknown[]) => __DEV__ && console.log('[OBD]', ...args),
  info: (...args: unknown[]) => console.log('[OBD]', ...args),
  warn: (...args: unknown[]) => __DEV__ && console.warn('[OBD]', ...args),
  error: (...args: unknown[]) => __DEV__ && console.error('[OBD]', ...args),
};

/**
 * Deferred pattern - converts event-driven APIs to Promise-based.
 */
class Deferred<T, E = Error> {
  promise: Promise<T>;
  resolve!: (value: T) => void;
  reject!: (error: E) => void;
  private settled = false;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = (value: T) => {
        if (!this.settled) {
          this.settled = true;
          resolve(value);
        }
      };
      this.reject = (error: E) => {
        if (!this.settled) {
          this.settled = true;
          reject(error);
        }
      };
    });
  }

  get isSettled() {
    return this.settled;
  }
}

const initialState: OBDState = {
  status: 'idle',
  deviceName: null,
  deviceId: null,
  obdData: null,
  error: null,
  isPolling: false,
};

/**
 * Base64 decode helper (React Native compatible)
 */
const decodeBase64 = (base64: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let buffer = 0;
  let bits = 0;

  for (const char of base64) {
    if (char === '=') break;
    const index = chars.indexOf(char);
    if (index === -1) continue;

    buffer = (buffer << 6) | index;
    bits += 6;

    while (bits >= 8) {
      bits -= 8;
      result += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return result;
};

/**
 * Base64 encode helper
 */
const encodeBase64 = (str: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < str.length; i++) {
    buffer = (buffer << 8) | str.charCodeAt(i);
    bits += 8;

    while (bits >= 6) {
      bits -= 6;
      result += chars[(buffer >> bits) & 0x3f];
    }
  }

  if (bits > 0) {
    buffer <<= 6 - bits;
    result += chars[buffer & 0x3f];
  }

  while (result.length % 4 !== 0) {
    result += '=';
  }

  return result;
};

/**
 * Parse any OBD-II response and extract PID + value
 * Format: "41 XX YY [ZZ]" where XX is PID, YY ZZ are data bytes
 * Returns { pid, value } or null if parsing fails
 */
const parseAnyOBDResponse = (response: string): { pid: string; value: number } | null => {
  // Remove extra whitespace and convert to uppercase
  const clean = response.replace(/\s+/g, ' ').trim().toUpperCase();
  
  // Check for NO DATA or error responses
  if (clean.includes('NO DATA') || clean.includes('ERROR') || clean.includes('?')) {
    return null;
  }
  
  // Match pattern: 41 XX followed by data bytes
  // Examples: "41 0C 39 D0", "41 0D 26", "41 05 78", "41 04 80"
  const match = clean.match(/41\s+([0-9A-F]{2})\s+([0-9A-F]{2})(?:\s+([0-9A-F]{2}))?/);
  
  if (!match) {
    log.debug('No OBD pattern match in:', clean);
    return null;
  }
  
  const pid = match[1]; // "0C", "0D", "05", "04"
  const byteA = parseInt(match[2], 16);
  const byteB = match[3] ? parseInt(match[3], 16) : null;
  
  log.debug('Matched PID:', pid, 'A:', byteA, 'B:', byteB);
  
  let value: number;
  
  switch (pid) {
    case '0C': // RPM: (A * 256 + B) / 4
      if (byteB === null) return null;
      value = (byteA * 256 + byteB) / 4;
      break;
    case '0D': // Speed: A km/h
      value = byteA;
      break;
    case '05': // Coolant temp: A - 40 °C
      value = byteA - 40;
      break;
    case '04': // Engine load: A * 100 / 255 %
      value = (byteA * 100) / 255;
      break;
    default:
      log.debug('Unknown PID:', pid);
      return null;
  }
  
  return { pid, value };
};

export function useOBD() {
  const [state, setState] = useState<OBDState>(initialState);
  const managerRef = useRef<BleManager | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isReconnectingRef = useRef(false);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  const disconnectListenerRef = useRef<{ remove: () => void } | null>(null);
  const isDisconnectingRef = useRef(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanRetryCountRef = useRef(0);
  const isScanningRef = useRef(false);
  const disconnectCompleteRef = useRef<Deferred<void, Error> | null>(null);
  
  // OBD-specific refs
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);
  const commandIndexRef = useRef(0); // Track which command to send next
  
  // Current OBD values (updated as responses come in)
  const obdValuesRef = useRef<{
    rpm: number | null;
    speed: number | null;
    coolantTemp: number | null;
    engineLoad: number | null;
  }>({
    rpm: null,
    speed: null,
    coolantTemp: null,
    engineLoad: null,
  });

  // Initialize BLE Manager
  useEffect(() => {
    managerRef.current = new BleManager();

    const subscription = managerRef.current.onStateChange((bleState) => {
      if (bleState === State.PoweredOff) {
        setState((prev) => ({
          ...prev,
          status: 'disconnected',
          error: 'Bluetooth is turned off',
          isPolling: false,
        }));
        stopPolling();
      }
    }, true);

    return () => {
      subscription.remove();
      stopPolling();
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
      disconnectListenerRef.current?.remove();
      disconnectListenerRef.current = null;
      subscriptionRef.current = null;
      managerRef.current?.destroy();
    };
  }, []);

  // Request permissions for Android
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      return true;
    }

    try {
      const apiLevel = typeof Platform.Version === 'string'
        ? parseInt(Platform.Version, 10)
        : Platform.Version;

      if (apiLevel >= 31) {
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(results).every(
          (result) => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          setState((prev) => ({
            ...prev,
            error: 'Bluetooth permissions are required',
          }));
          return false;
        }
      } else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          setState((prev) => ({
            ...prev,
            error: 'Location permission is required for BLE scanning',
          }));
          return false;
        }
      }

      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to request permissions',
      }));
      return false;
    }
  }, []);

  // Handle incoming OBD response - parse and update the appropriate value
  const handleOBDResponse = useCallback((response: string) => {
    const parsed = parseAnyOBDResponse(response);
    if (!parsed) {
      log.debug('Could not parse response:', response);
      return;
    }
    
    log.info('Parsed OBD:', parsed.pid, '=', parsed.value);
    
    // Update the appropriate value
    switch (parsed.pid) {
      case '0C':
        obdValuesRef.current.rpm = parsed.value;
        break;
      case '0D':
        obdValuesRef.current.speed = parsed.value;
        break;
      case '05':
        obdValuesRef.current.coolantTemp = parsed.value;
        break;
      case '04':
        obdValuesRef.current.engineLoad = parsed.value;
        break;
    }
    
    // Update state with current values
    setState((prev) => ({
      ...prev,
      obdData: {
        rpm: obdValuesRef.current.rpm,
        speed: obdValuesRef.current.speed,
        coolantTemp: obdValuesRef.current.coolantTemp,
        engineLoad: obdValuesRef.current.engineLoad,
        timestamp: new Date(),
      },
    }));
  }, []);

  // Send a single OBD command (fire and forget - response handled by notification)
  const sendCommand = useCallback(async (device: Device, command: string) => {
    try {
      const base64Command = encodeBase64(command);
      log.debug('Sending:', command.trim());
      await device.writeCharacteristicWithoutResponseForService(
        NUS_SERVICE_UUID,
        NUS_RX_UUID,
        base64Command
      );
    } catch (error) {
      log.warn('Failed to send command:', error);
    }
  }, []);

  // Commands to cycle through
  const OBD_COMMAND_LIST = [
    OBD_COMMANDS.RPM,
    OBD_COMMANDS.SPEED,
    OBD_COMMANDS.COOLANT_TEMP,
    OBD_COMMANDS.ENGINE_LOAD,
  ];

  // Send next OBD command in cycle
  const sendNextCommand = useCallback(async () => {
    const device = deviceRef.current;
    if (!device || !isPollingRef.current) {
      return;
    }

    const command = OBD_COMMAND_LIST[commandIndexRef.current];
    await sendCommand(device, command);
    
    // Move to next command
    commandIndexRef.current = (commandIndexRef.current + 1) % OBD_COMMAND_LIST.length;
  }, [sendCommand]);

  // Start polling OBD data
  const startPolling = useCallback(() => {
    if (isPollingRef.current) {
      return;
    }

    log.info('Starting OBD polling');
    isPollingRef.current = true;
    commandIndexRef.current = 0;
    setState((prev) => ({ ...prev, isPolling: true }));

    // Send commands at interval - responses are handled asynchronously
    sendNextCommand();
    pollingIntervalRef.current = setInterval(sendNextCommand, COMMAND_DELAY);
  }, [sendNextCommand]);

  // Stop polling OBD data
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isPollingRef.current = false;
    // Reset values
    obdValuesRef.current = { rpm: null, speed: null, coolantTemp: null, engineLoad: null };
    setState((prev) => ({ ...prev, isPolling: false }));
    log.info('Stopped OBD polling');
  }, []);

  // Subscribe to TX characteristic for notifications
  const subscribeToNotifications = useCallback(async (device: Device) => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.remove();
      } catch (e) {
        log.debug('Subscription cleanup:', e);
      }
      subscriptionRef.current = null;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    try {
      log.info('Subscribing to TX characteristic:', NUS_TX_UUID);
      const subscription = device.monitorCharacteristicForService(
        NUS_SERVICE_UUID,
        NUS_TX_UUID,
        (error: BleError | null, char: Characteristic | null) => {
          if (error) {
            if (isDisconnectingRef.current) {
              return;
            }
            log.warn('Notification error:', error);
            return;
          }

          if (char?.value) {
            const decoded = decodeBase64(char.value);
            log.debug('BLE Notification received:', decoded);
            
            // Parse the response and update the appropriate OBD value
            handleOBDResponse(decoded);
          }
        }
      );

      subscriptionRef.current = subscription;
      log.info('Successfully subscribed to notifications');
      return true;
    } catch (error) {
      log.warn('Failed to subscribe:', error);
      return false;
    }
  }, [handleOBDResponse]);

  // Connect to device
  const connectToDevice = useCallback(
    async (device: Device) => {
      log.debug('connectToDevice called for:', device.name);

      if (isDisconnectingRef.current) {
        log.debug('Skipping connect - disconnect in progress');
        return null;
      }

      try {
        setState((prev) => ({
          ...prev,
          status: 'connecting',
          error: null,
        }));

        disconnectListenerRef.current?.remove();
        disconnectListenerRef.current = null;

        log.debug('Connecting to device...');
        const connectedDevice = await device.connect({
          timeout: CONNECTION_TIMEOUT,
          refreshGatt: 'OnConnected',
        });

        log.info('Connected to device:', connectedDevice.name);
        deviceRef.current = connectedDevice;

        // Monitor disconnection
        const disconnectSubscription = connectedDevice.onDisconnected(
          (error, disconnectedDevice) => {
            if (isDisconnectingRef.current) {
              return;
            }

            log.info('Device disconnected unexpectedly:', disconnectedDevice?.name, error?.message);
            
            stopPolling();
            subscriptionRef.current = null;

            setState((prev) => ({
              ...prev,
              status: 'disconnected',
              isPolling: false,
            }));

            if (
              !isDisconnectingRef.current &&
              !isReconnectingRef.current &&
              reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
            ) {
              isReconnectingRef.current = true;
              reconnectAttemptsRef.current++;

              setTimeout(() => {
                isReconnectingRef.current = false;
                if (deviceRef.current && !isDisconnectingRef.current) {
                  connectToDevice(deviceRef.current);
                }
              }, RECONNECT_DELAY);
            }
          }
        );

        disconnectListenerRef.current = disconnectSubscription;

        // Discover services
        await connectedDevice.discoverAllServicesAndCharacteristics();

        setState((prev) => ({
          ...prev,
          status: 'connected',
          deviceName: connectedDevice.name || 'Unknown Device',
          deviceId: connectedDevice.id,
          error: null,
        }));

        reconnectAttemptsRef.current = 0;

        // Subscribe to notifications
        await subscribeToNotifications(connectedDevice);

        // Initialize with ATZ command
        log.debug('Sending ATZ initialization');
        await sendCommand(connectedDevice, 'ATZ\r');
        
        // Small delay then start polling
        await new Promise((resolve) => setTimeout(resolve, 500));
        startPolling();

        return connectedDevice;
      } catch (error) {
        log.debug('Connection error:', error);

        let errorMessage = 'Connection failed';
        let showToUser = true;

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error && typeof error === 'object') {
          const bleError = error as { message?: string; reason?: string };
          errorMessage = bleError.message || bleError.reason || 'Connection failed';
        }

        if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
          errorMessage = 'Connection timed out. Make sure the device is nearby and try again.';
        } else if (errorMessage.includes('cancelled') || errorMessage.includes('Cancelled')) {
          showToUser = false;
        } else if (errorMessage.includes('disconnected')) {
          errorMessage = 'Device disconnected during connection. Please try again.';
        }

        setState((prev) => ({
          ...prev,
          status: 'idle',
          error: showToUser ? errorMessage : null,
        }));

        await new Promise((resolve) => setTimeout(resolve, 500));
        return null;
      }
    },
    [subscribeToNotifications, sendCommand, startPolling, stopPolling]
  );

  // Start scanning
  const startScan = useCallback(async () => {
    log.debug('startScan called');
    const manager = managerRef.current;
    if (!manager) {
      log.warn('No manager available');
      return;
    }

    if (isScanningRef.current) {
      log.debug('Scan already in progress');
      return;
    }

    isScanningRef.current = true;
    setState((prev) => ({
      ...prev,
      status: 'preparing',
      error: null,
    }));

    if (disconnectCompleteRef.current) {
      log.debug('Waiting for pending disconnect...');
      try {
        await disconnectCompleteRef.current.promise;
      } catch (e) {
        log.debug('Disconnect wait error (ignored):', e);
      }
    }

    isDisconnectingRef.current = false;
    isReconnectingRef.current = false;
    reconnectAttemptsRef.current = 0;
    scanRetryCountRef.current = 0;

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      isScanningRef.current = false;
      setState((prev) => ({ ...prev, status: 'idle' }));
      return;
    }

    const bleState = await manager.state();
    if (bleState !== State.PoweredOn) {
      setState((prev) => ({
        ...prev,
        status: 'idle',
        error: 'Please turn on Bluetooth',
      }));
      isScanningRef.current = false;
      return;
    }

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }

    const attemptScan = async (): Promise<boolean> => {
      try {
        await manager.stopDeviceScan();
      } catch (e) {
        log.debug('Stop scan error (ignored):', e);
      }

      const extraDelay = scanRetryCountRef.current * 200;
      if (extraDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, extraDelay));
      }

      const scanStarted = new Deferred<boolean, Error>();

      try {
        manager.startDeviceScan(
          null,
          {
            allowDuplicates: false,
            scanMode: ScanMode.LowLatency,
          },
          async (error, device) => {
            if (error) {
              log.debug('Scan callback error:', error.message);

              if (!scanStarted.isSettled && scanRetryCountRef.current < MAX_SCAN_RETRIES) {
                scanRetryCountRef.current++;

                try {
                  await manager.stopDeviceScan();
                } catch (e) {
                  // Ignore
                }

                const success = await attemptScan();
                scanStarted.resolve(success);
              } else if (!scanStarted.isSettled) {
                isScanningRef.current = false;
                setState((prev) => ({
                  ...prev,
                  status: 'idle',
                  error: 'Bluetooth is busy. Please wait a moment and try again.',
                }));
                scanStarted.resolve(false);
              }
              return;
            }

            scanStarted.resolve(true);

            if (device?.name) {
              log.debug('Found device:', device.name);
            }

            if (device?.name?.includes(TARGET_DEVICE_NAME)) {
              log.info('Found target device:', device.name);
              if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
                scanTimeoutRef.current = null;
              }
              manager.stopDeviceScan();
              isScanningRef.current = false;
              await connectToDevice(device);
            }
          }
        );

        setTimeout(() => {
          if (!scanStarted.isSettled) {
            scanStarted.resolve(true);
          }
        }, 500);
      } catch (e) {
        log.warn('startDeviceScan threw:', e);
        scanStarted.resolve(false);
      }

      return scanStarted.promise;
    };

    setState((prev) => ({
      ...prev,
      status: 'scanning',
      error: null,
    }));

    const scanStarted = await attemptScan();

    if (!scanStarted) {
      return;
    }

    scanTimeoutRef.current = setTimeout(() => {
      manager.stopDeviceScan();
      isScanningRef.current = false;
      setState((prev) => {
        if (prev.status === 'scanning') {
          return {
            ...prev,
            status: 'idle',
            error: `"${TARGET_DEVICE_NAME}" not found. Make sure it's powered on and nearby.`,
          };
        }
        return prev;
      });
    }, SCAN_TIMEOUT);
  }, [requestPermissions, connectToDevice]);

  // Stop scanning
  const stopScan = useCallback(async () => {
    log.debug('stopScan called');
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    isScanningRef.current = false;
    try {
      await managerRef.current?.stopDeviceScan();
    } catch (e) {
      log.debug('Stop scan error (ignored):', e);
    }
    setState((prev) => ({
      ...prev,
      status: 'idle',
    }));
  }, []);

  // Disconnect from device
  const disconnect = useCallback(async () => {
    log.debug('disconnect called');

    const disconnectComplete = new Deferred<void, Error>();
    disconnectCompleteRef.current = disconnectComplete;

    stopPolling();
    isDisconnectingRef.current = true;
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS;
    isScanningRef.current = false;

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }

    try {
      await managerRef.current?.stopDeviceScan();
    } catch (e) {
      log.debug('Stop scan during disconnect error (ignored):', e);
    }

    disconnectListenerRef.current?.remove();
    disconnectListenerRef.current = null;
    subscriptionRef.current = null;

    if (deviceRef.current) {
      try {
        await deviceRef.current.cancelConnection();
      } catch (error) {
        log.debug('Disconnect error (ignored):', error);
      }
    }

    deviceRef.current = null;

    setState(initialState);

    setTimeout(() => {
      isDisconnectingRef.current = false;
      isReconnectingRef.current = false;
      disconnectComplete.resolve();
      disconnectCompleteRef.current = null;
    }, 1500);
  }, [stopPolling]);

  return {
    ...state,
    startScan,
    stopScan,
    disconnect,
    requestPermissions,
  };
}
