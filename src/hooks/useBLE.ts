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
import {
  BLEState,
  ConnectionStatus,
  HeartbeatData,
  DiscoveredService,
  DiscoveredCharacteristic,
} from '../types';

const TARGET_DEVICE_NAME = 'CarTag';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const SCAN_TIMEOUT = 15000; // 15 seconds scan timeout
const MAX_SCAN_RETRIES = 3; // Maximum scan retry attempts
const CONNECTION_TIMEOUT = 10000; // 10 seconds connection timeout

// Logging helper - verbose in dev, minimal in production
const log = {
  debug: (...args: unknown[]) => __DEV__ && console.log('[BLE]', ...args),
  info: (...args: unknown[]) => console.log('[BLE]', ...args),
  warn: (...args: unknown[]) => __DEV__ && console.warn('[BLE]', ...args),
  error: (...args: unknown[]) => __DEV__ && console.error('[BLE]', ...args),
};

// UUIDs matching the ESP32 firmware
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

/**
 * Deferred pattern - converts event-driven APIs to Promise-based.
 * Useful for single-shot async operations where you need to resolve/reject
 * from outside the Promise executor.
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

const initialState: BLEState = {
  status: 'idle',
  deviceName: null,
  deviceId: null,
  heartbeat: null,
  error: null,
  services: [],
  selectedCharacteristic: null,
};

export function useBLE() {
  const [state, setState] = useState<BLEState>(initialState);
  const managerRef = useRef<BleManager | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isReconnectingRef = useRef(false);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  const disconnectListenerRef = useRef<{ remove: () => void } | null>(null);
  const isDisconnectingRef = useRef(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanRetryCountRef = useRef(0);
  const isScanningRef = useRef(false); // Track if we're in a scan operation
  
  // Deferred to wait for disconnect to complete
  const disconnectCompleteRef = useRef<Deferred<void, Error> | null>(null);

  // Initialize BLE Manager
  useEffect(() => {
    managerRef.current = new BleManager();

    const subscription = managerRef.current.onStateChange((bleState) => {
      if (bleState === State.PoweredOff) {
        setState((prev) => ({
          ...prev,
          status: 'disconnected',
          error: 'Bluetooth is turned off',
        }));
      }
    }, true);

    return () => {
      subscription.remove();
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
      disconnectListenerRef.current?.remove();
      disconnectListenerRef.current = null;
      // Don't call subscriptionRef.current?.remove() - just clear it
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
        // Android 12+
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
        // Android < 12
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

  // Base64 decode helper (React Native compatible)
  const decodeBase64 = (base64: string): string => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
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

  // Parse heartbeat data from characteristic value
  const parseHeartbeatData = useCallback(
    (value: string | null): HeartbeatData | null => {
      if (!value) return null;

      try {
        // Decode base64 to string
        const decoded = decodeBase64(value);

        // Try parsing as integer first
        const counterValue = parseInt(decoded, 10);
        if (!isNaN(counterValue)) {
          return {
            counter: counterValue,
            timestamp: new Date(),
            raw: decoded,
          };
        }

        // Try parsing as JSON
        try {
          const json = JSON.parse(decoded);
          if (typeof json.counter === 'number') {
            return {
              counter: json.counter,
              timestamp: new Date(),
              raw: decoded,
            };
          }
        } catch {
          // Not JSON
        }

        // Fallback: try to extract any number from the string
        const match = decoded.match(/\d+/);
        if (match) {
          return {
            counter: parseInt(match[0], 10),
            timestamp: new Date(),
            raw: decoded,
          };
        }

        return {
          counter: 0,
          timestamp: new Date(),
          raw: decoded,
        };
      } catch {
        return null;
      }
    },
    []
  );

  // Discover services and characteristics
  const discoverServices = useCallback(async (device: Device) => {
    try {
      await device.discoverAllServicesAndCharacteristics();
      const services = await device.services();

      const discoveredServices: DiscoveredService[] = [];

      for (const service of services) {
        const characteristics = await service.characteristics();

        const discoveredChars: DiscoveredCharacteristic[] = characteristics.map(
          (char) => ({
            uuid: char.uuid,
            isReadable: char.isReadable,
            isWritable:
              char.isWritableWithResponse || char.isWritableWithoutResponse,
            isNotifiable: char.isNotifiable || char.isIndicatable,
            serviceUUID: service.uuid,
          })
        );

        discoveredServices.push({
          uuid: service.uuid,
          characteristics: discoveredChars,
        });
      }

      setState((prev) => ({
        ...prev,
        services: discoveredServices,
      }));

      return discoveredServices;
    } catch (error) {
      log.warn('Failed to discover services:', error);
      return [];
    }
  }, []);

  // Subscribe to a characteristic for notifications
  const subscribeToCharacteristic = useCallback(
    async (device: Device, characteristic: DiscoveredCharacteristic) => {
      // Remove existing subscription safely
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.remove();
        } catch (e) {
          // Ignore errors during cleanup
          log.debug('Subscription cleanup:', e);
        }
        subscriptionRef.current = null;
        // Small delay to let the BLE stack settle
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      try {
        log.debug('Subscribing to characteristic:', characteristic.uuid);
        const subscription = device.monitorCharacteristicForService(
          characteristic.serviceUUID,
          characteristic.uuid,
          (error: BleError | null, char: Characteristic | null) => {
            if (error) {
              // Ignore "device was disconnected" errors during intentional disconnect
              if (isDisconnectingRef.current) {
                log.debug('Subscription ended (disconnect in progress)');
                return;
              }
              log.warn('Characteristic monitoring error:', error);
              return;
            }

            if (char?.value) {
              log.debug('Received BLE data:', char.value);
              const heartbeat = parseHeartbeatData(char.value);
              log.debug('Parsed heartbeat:', heartbeat);
              if (heartbeat) {
                setState((prev) => ({
                  ...prev,
                  heartbeat,
                }));
              }
            }
          }
        );

        subscriptionRef.current = subscription;

        setState((prev) => ({
          ...prev,
          selectedCharacteristic: characteristic,
        }));

        return true;
      } catch (error) {
        log.warn('Failed to subscribe to characteristic:', error);
        return false;
      }
    },
    [parseHeartbeatData]
  );

  // Auto-subscribe to first notifiable characteristic
  const autoSubscribe = useCallback(
    async (device: Device, services: DiscoveredService[]) => {
      log.debug('Auto-subscribing, found services:', services.map(s => s.uuid));
      
      // First, try to find our specific characteristic
      for (const service of services) {
        if (service.uuid.toLowerCase() === SERVICE_UUID.toLowerCase()) {
          for (const char of service.characteristics) {
            if (char.uuid.toLowerCase() === CHARACTERISTIC_UUID.toLowerCase() && char.isNotifiable) {
              log.debug('Found target characteristic:', char.uuid);
              await subscribeToCharacteristic(device, char);
              return true;
            }
          }
        }
      }
      
      // Fallback: subscribe to first notifiable characteristic
      for (const service of services) {
        for (const char of service.characteristics) {
          if (char.isNotifiable) {
            log.debug('Using fallback characteristic:', char.uuid);
            await subscribeToCharacteristic(device, char);
            return true;
          }
        }
      }
      log.warn('No notifiable characteristic found');
      return false;
    },
    [subscribeToCharacteristic]
  );

  // Connect to device
  const connectToDevice = useCallback(
    async (device: Device) => {
      log.debug('connectToDevice called for:', device.name);
      
      // Don't connect if we're already connected or in the process of disconnecting
      if (isDisconnectingRef.current) {
        log.debug('Skipping connect - isDisconnecting is true');
        return null;
      }

      // Track if we're currently connecting (to avoid cleanup race conditions)
      let connectionAttemptActive = true;

      try {
        setState((prev) => ({
          ...prev,
          status: 'connecting',
          error: null,
        }));

        // Remove any existing disconnect listener
        disconnectListenerRef.current?.remove();
        disconnectListenerRef.current = null;

        log.debug('Connecting to device...');
        
        // Use the library's built-in timeout option
        // This is safer than Promise.race because it handles cleanup internally
        const connectedDevice = await device.connect({
          timeout: CONNECTION_TIMEOUT,
          refreshGatt: 'OnConnected', // Refresh GATT cache on connection
        });
        
        connectionAttemptActive = false;
        log.info('Connected to device:', connectedDevice.name);
        deviceRef.current = connectedDevice;

        // Monitor disconnection - store the subscription
        const disconnectSubscription = connectedDevice.onDisconnected((error, disconnectedDevice) => {
          // Ignore if we initiated the disconnect
          if (isDisconnectingRef.current) {
            return;
          }

          log.info('Device disconnected unexpectedly:', disconnectedDevice?.name, error?.message);

          // Clear subscription ref without calling remove (avoid crash)
          subscriptionRef.current = null;

          setState((prev) => ({
            ...prev,
            status: 'disconnected',
            selectedCharacteristic: null,
          }));

          // Attempt reconnection only if not manually disconnecting
          if (!isDisconnectingRef.current && !isReconnectingRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            isReconnectingRef.current = true;
            reconnectAttemptsRef.current++;

            setTimeout(() => {
              isReconnectingRef.current = false;
              if (deviceRef.current && !isDisconnectingRef.current) {
                connectToDevice(deviceRef.current);
              }
            }, RECONNECT_DELAY);
          }
        });

        disconnectListenerRef.current = disconnectSubscription;

        // Discover services
        const services = await discoverServices(connectedDevice);

        setState((prev) => ({
          ...prev,
          status: 'connected',
          deviceName: connectedDevice.name || 'Unknown Device',
          deviceId: connectedDevice.id,
          error: null,
        }));

        reconnectAttemptsRef.current = 0;

        // Auto-subscribe to first notifiable characteristic
        await autoSubscribe(connectedDevice, services);

        return connectedDevice;
      } catch (error) {
        connectionAttemptActive = false;
        log.debug('Connection error:', error);
        
        // Extract error message safely (react-native-ble-plx can have weird error objects)
        let errorMessage = 'Connection failed';
        let showToUser = true;
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error && typeof error === 'object') {
          // BleError objects have a 'reason' property
          const bleError = error as { message?: string; reason?: string };
          errorMessage = bleError.message || bleError.reason || 'Connection failed';
        }
        
        // Check for specific error types and provide user-friendly messages
        if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
          errorMessage = 'Connection timed out. Make sure the device is nearby and try again.';
        } else if (errorMessage.includes('cancelled') || errorMessage.includes('Cancelled')) {
          // User-initiated cancellation or quick re-scan - don't show error
          showToUser = false;
        } else if (errorMessage.includes('disconnected')) {
          errorMessage = 'Device disconnected during connection. Please try again.';
        }
        
        // Don't try to cancel connection here - it can cause crashes in react-native-ble-plx
        // when the device disconnected during connection (null error code bug)
        // The library should clean up automatically
        
        setState((prev) => ({
          ...prev,
          status: 'idle',
          error: showToUser ? errorMessage : null,
        }));
        
        // Small delay before allowing retry to let BLE stack settle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return null;
      }
    },
    [discoverServices, autoSubscribe]
  );

  // Start scanning
  const startScan = useCallback(async () => {
    log.debug('startScan called');
    const manager = managerRef.current;
    if (!manager) {
      log.warn('No manager available');
      return;
    }

    // CRITICAL: Prevent multiple concurrent scan operations
    // This check MUST happen synchronously before any await
    if (isScanningRef.current) {
      log.debug('Scan already in progress, ignoring');
      return;
    }

    // IMMEDIATELY set the flag and state BEFORE any async operations
    // This prevents multiple button presses from queuing up scans
    isScanningRef.current = true;
    setState((prev) => ({
      ...prev,
      status: 'preparing',
      error: null,
    }));
    log.debug('Set preparing state synchronously');

    // Now we can safely do async work - button is already disabled
    // IMPORTANT: Wait for any pending disconnect to complete
    // This prevents the "Cannot start scanning operation" error
    if (disconnectCompleteRef.current) {
      log.debug('Waiting for pending disconnect to complete...');
      try {
        await disconnectCompleteRef.current.promise;
        log.debug('Disconnect completed, proceeding with scan');
      } catch (e) {
        log.debug('Disconnect wait error (ignored):', e);
      }
    }

    // Reset other flags (isScanningRef already set above)
    log.debug('Resetting flags - isDisconnecting was:', isDisconnectingRef.current);
    isDisconnectingRef.current = false;
    isReconnectingRef.current = false;
    reconnectAttemptsRef.current = 0;
    scanRetryCountRef.current = 0;

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      log.debug('Permissions not granted');
      isScanningRef.current = false;
      setState((prev) => ({ ...prev, status: 'idle' }));
      return;
    }

    // Check if Bluetooth is powered on
    const bleState = await manager.state();
    log.debug('Bluetooth state:', bleState);
    if (bleState !== State.PoweredOn) {
      setState((prev) => ({
        ...prev,
        status: 'idle',
        error: 'Please turn on Bluetooth',
      }));
      isScanningRef.current = false;
      return;
    }

    // Clear any existing scan timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }

    // Helper function to attempt starting a scan with retries
    // Uses Deferred pattern to convert event-driven scan to Promise-based
    const attemptScan = async (): Promise<boolean> => {
      // Stop any existing scan before starting a new one
      // In v3.x, stopDeviceScan() returns a Promise - await it to ensure scan is fully stopped
      try {
        log.debug('Stopping any existing scan (awaiting Promise)...');
        await manager.stopDeviceScan();
        log.debug('Previous scan stopped successfully');
      } catch (e) {
        log.debug('Stop scan error (ignored):', e);
      }

      // Small additional delay for the native BLE stack to fully release resources
      // This is a safety margin - the await above should handle most cases
      const extraDelay = scanRetryCountRef.current * 200; // 0ms first try, 200ms, 400ms, 600ms
      if (extraDelay > 0) {
        log.debug(`Extra delay ${extraDelay}ms for retry...`);
        await new Promise(resolve => setTimeout(resolve, extraDelay));
      }

      // Use Deferred pattern: the scan callback will resolve/reject this
      const scanStarted = new Deferred<boolean, Error>();

      log.debug('Starting device scan (attempt', scanRetryCountRef.current + 1, ')');
      
      try {
        manager.startDeviceScan(
          null, // No UUID filter - scan all devices
          { 
            allowDuplicates: false,
            scanMode: ScanMode.LowLatency,
          }, 
          async (error, device) => {
            if (error) {
              // These errors are expected during BLE stack contention - don't alarm users
              log.debug('Scan callback error (will retry):', error.message);
              
              // Check if we should retry (only on first error, Deferred handles idempotency)
              if (!scanStarted.isSettled && scanRetryCountRef.current < MAX_SCAN_RETRIES) {
                scanRetryCountRef.current++;
                log.debug(`Retrying scan (attempt ${scanRetryCountRef.current + 1}/${MAX_SCAN_RETRIES + 1})`);
                
                // Stop the failed scan
                try {
                  await manager.stopDeviceScan();
                } catch (e) {
                  // Ignore
                }
                
                // Retry and resolve with that result
                const success = await attemptScan();
                scanStarted.resolve(success);
              } else if (!scanStarted.isSettled) {
                // Max retries reached, give up with user-friendly message
                log.warn('Max scan retries reached');
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

            // Scan is working - resolve true on first successful callback
            scanStarted.resolve(true);

            // Log devices we find (only ones with names to reduce noise)
            if (device?.name) {
              log.debug('Found device:', device.name, device.id);
            }

            // Check device name
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
        
        // Give the scan a moment to either error or start successfully
        // If we don't get a callback within 500ms, assume it started
        setTimeout(() => {
          if (!scanStarted.isSettled) {
            log.debug('Scan started (no immediate callback)');
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

    // Start the scan with retry logic
    const scanStarted = await attemptScan();
    
    if (!scanStarted) {
      return;
    }

    // Stop scanning after timeout
    scanTimeoutRef.current = setTimeout(() => {
      log.debug('Scan timeout reached');
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
    
    // Create a Deferred that will resolve when disconnect is fully complete
    // This allows startScan to wait for it
    const disconnectComplete = new Deferred<void, Error>();
    disconnectCompleteRef.current = disconnectComplete;
    
    // Set flag to prevent reconnection attempts
    isDisconnectingRef.current = true;
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS;
    isScanningRef.current = false;
    
    // Clear any scan timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    // Stop any ongoing scan (await the Promise in v3.x)
    try {
      await managerRef.current?.stopDeviceScan();
    } catch (e) {
      log.debug('Stop scan during disconnect error (ignored):', e);
    }
    
    // Remove disconnect listener
    disconnectListenerRef.current?.remove();
    disconnectListenerRef.current = null;
    
    // Clear the subscription reference without calling remove()
    subscriptionRef.current = null;

    if (deviceRef.current) {
      try {
        log.debug('Cancelling connection to device');
        await deviceRef.current.cancelConnection();
        log.debug('Connection cancelled');
      } catch (error) {
        // Ignore disconnect errors - device may already be disconnected
        log.debug('Disconnect error (ignored):', error);
      }
    }

    deviceRef.current = null;
    
    // Reset state immediately
    setState(initialState);
    
    // Wait for BLE stack to fully settle, then resolve the Deferred
    log.debug('Waiting for BLE stack to settle...');
    setTimeout(() => {
      log.debug('Disconnect fully complete');
      isDisconnectingRef.current = false;
      isReconnectingRef.current = false;
      disconnectComplete.resolve();
      disconnectCompleteRef.current = null;
    }, 1500); // Increased to 1.5s for more reliable settling
  }, []);

  // Select a characteristic to subscribe to
  const selectCharacteristic = useCallback(
    async (characteristic: DiscoveredCharacteristic) => {
      if (deviceRef.current && characteristic.isNotifiable) {
        await subscribeToCharacteristic(deviceRef.current, characteristic);
      }
    },
    [subscribeToCharacteristic]
  );

  return {
    ...state,
    startScan,
    stopScan,
    disconnect,
    selectCharacteristic,
    requestPermissions,
  };
}

