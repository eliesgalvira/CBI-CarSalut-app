import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import {
  BleManager,
  Device,
  Characteristic,
  State,
  BleError,
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

// UUIDs matching the ESP32 firmware
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

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
      console.error('Failed to discover services:', error);
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
          console.log('Subscription cleanup:', e);
        }
        subscriptionRef.current = null;
        // Small delay to let the BLE stack settle
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      try {
        console.log('Subscribing to characteristic:', characteristic.uuid);
        const subscription = device.monitorCharacteristicForService(
          characteristic.serviceUUID,
          characteristic.uuid,
          (error: BleError | null, char: Characteristic | null) => {
            if (error) {
              console.error('Characteristic monitoring error:', error);
              return;
            }

            if (char?.value) {
              console.log('Received BLE data:', char.value);
              const heartbeat = parseHeartbeatData(char.value);
              console.log('Parsed heartbeat:', heartbeat);
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
        console.error('Failed to subscribe to characteristic:', error);
        return false;
      }
    },
    [parseHeartbeatData]
  );

  // Auto-subscribe to first notifiable characteristic
  const autoSubscribe = useCallback(
    async (device: Device, services: DiscoveredService[]) => {
      console.log('Auto-subscribing, found services:', services.map(s => s.uuid));
      
      // First, try to find our specific characteristic
      for (const service of services) {
        if (service.uuid.toLowerCase() === SERVICE_UUID.toLowerCase()) {
          for (const char of service.characteristics) {
            if (char.uuid.toLowerCase() === CHARACTERISTIC_UUID.toLowerCase() && char.isNotifiable) {
              console.log('Found target characteristic:', char.uuid);
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
            console.log('Using fallback characteristic:', char.uuid);
            await subscribeToCharacteristic(device, char);
            return true;
          }
        }
      }
      console.log('No notifiable characteristic found');
      return false;
    },
    [subscribeToCharacteristic]
  );

  // Connect to device
  const connectToDevice = useCallback(
    async (device: Device) => {
      // Don't connect if we're already connected or in the process of disconnecting
      if (isDisconnectingRef.current) {
        return null;
      }

      try {
        setState((prev) => ({
          ...prev,
          status: 'connecting',
          error: null,
        }));

        // Remove any existing disconnect listener
        disconnectListenerRef.current?.remove();
        disconnectListenerRef.current = null;

        const connectedDevice = await device.connect();
        deviceRef.current = connectedDevice;

        // Monitor disconnection - store the subscription
        const disconnectSubscription = connectedDevice.onDisconnected((error, disconnectedDevice) => {
          // Ignore if we initiated the disconnect
          if (isDisconnectingRef.current) {
            return;
          }

          console.log('Device disconnected:', disconnectedDevice?.name, error?.message);

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
        const errorMessage =
          error instanceof Error ? error.message : 'Connection failed';
        setState((prev) => ({
          ...prev,
          status: 'disconnected',
          error: errorMessage,
        }));
        return null;
      }
    },
    [discoverServices, autoSubscribe]
  );

  // Start scanning
  const startScan = useCallback(async () => {
    const manager = managerRef.current;
    if (!manager) return;

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    // Check if Bluetooth is powered on
    const bleState = await manager.state();
    if (bleState !== State.PoweredOn) {
      setState((prev) => ({
        ...prev,
        error: 'Please turn on Bluetooth',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      status: 'scanning',
      error: null,
    }));

    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        setState((prev) => ({
          ...prev,
          status: 'idle',
          error: error.message,
        }));
        return;
      }

      if (device?.name?.includes(TARGET_DEVICE_NAME)) {
        manager.stopDeviceScan();
        await connectToDevice(device);
      }
    });

    // Stop scanning after 30 seconds
    setTimeout(() => {
      manager.stopDeviceScan();
      setState((prev) => {
        if (prev.status === 'scanning') {
          return {
            ...prev,
            status: 'idle',
            error: `Device "${TARGET_DEVICE_NAME}" not found`,
          };
        }
        return prev;
      });
    }, 30000);
  }, [requestPermissions, connectToDevice]);

  // Stop scanning
  const stopScan = useCallback(() => {
    managerRef.current?.stopDeviceScan();
    setState((prev) => ({
      ...prev,
      status: 'idle',
    }));
  }, []);

  // Disconnect from device
  const disconnect = useCallback(async () => {
    // Set flag to prevent reconnection attempts
    isDisconnectingRef.current = true;
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS;
    
    // Remove disconnect listener
    disconnectListenerRef.current?.remove();
    disconnectListenerRef.current = null;
    
    // Clear the subscription reference without calling remove()
    subscriptionRef.current = null;

    if (deviceRef.current) {
      try {
        await deviceRef.current.cancelConnection();
      } catch (error) {
        // Ignore disconnect errors - device may already be disconnected
        console.log('Disconnect:', error);
      }
    }

    deviceRef.current = null;
    
    // Reset the disconnecting flag after a short delay
    setTimeout(() => {
      isDisconnectingRef.current = false;
    }, 500);
    
    setState(initialState);
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

