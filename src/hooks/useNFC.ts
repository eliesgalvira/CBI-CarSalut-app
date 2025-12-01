import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import NfcManager, { NfcTech, Ndef, NfcEvents } from 'react-native-nfc-manager';
import { NFCState, NFCStatus, NFCTagInfo } from '../types';

// Dummy message to write to NFC tag
const DUMMY_MESSAGE = 'Hello the key is VALIDATED';

// Timeout for NFC scan (15 seconds)
const SCAN_TIMEOUT = 15000;

// Retry settings for write operations
const WRITE_RETRY_COUNT = 2;
const WRITE_RETRY_DELAY = 100; // ms

// Logging helper - verbose in dev, minimal in production
const log = {
  debug: (...args: unknown[]) => __DEV__ && console.log('[NFC]', ...args),
  info: (...args: unknown[]) => console.log('[NFC]', ...args),
  warn: (...args: unknown[]) => __DEV__ && console.warn('[NFC]', ...args),
  error: (...args: unknown[]) => __DEV__ && console.error('[NFC]', ...args),
};

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

const initialState: NFCState = {
  status: 'idle',
  isSupported: false,
  isEnabled: false,
  tagInfo: null,
  lastMessage: null,
  error: null,
};

export function useNFC() {
  const [state, setState] = useState<NFCState>(initialState);
  
  // Refs to prevent race conditions
  const isScanningRef = useRef(false);
  const isWritingRef = useRef(false);
  const didTimeoutRef = useRef(false);
  const scanCompleteRef = useRef<Deferred<void, Error> | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize NFC Manager and check support
  useEffect(() => {
    let mounted = true;

    const initNfc = async () => {
      try {
        log.debug('Initializing NFC Manager...');
        
        // Check if NFC is supported
        const supported = await NfcManager.isSupported();
        log.debug('NFC supported:', supported);
        
        if (!supported) {
          if (mounted) {
            setState((prev) => ({
              ...prev,
              isSupported: false,
              error: 'NFC is not supported on this device',
            }));
          }
          return;
        }

        // Start NFC Manager
        await NfcManager.start();
        log.info('NFC Manager started');

        // Check if NFC is enabled
        const enabled = await NfcManager.isEnabled();
        log.debug('NFC enabled:', enabled);

        if (mounted) {
          setState((prev) => ({
            ...prev,
            isSupported: true,
            isEnabled: enabled,
            error: enabled ? null : 'Please enable NFC in your device settings',
          }));
        }
      } catch (error) {
        log.error('Failed to initialize NFC:', error);
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isSupported: false,
            error: 'Failed to initialize NFC',
          }));
        }
      }
    };

    initNfc();

    return () => {
      mounted = false;
      // Cleanup NFC
      log.debug('Cleaning up NFC Manager...');
      NfcManager.cancelTechnologyRequest().catch(() => {});
      // Note: Don't call NfcManager.unregisterTagEvent() as it may not exist in all versions
    };
  }, []);

  // Request NFC permission (Android only)
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      // iOS handles NFC permissions via entitlements
      return true;
    }

    try {
      // NFC doesn't require runtime permissions on most Android versions
      // but we check if NFC is enabled
      const enabled = await NfcManager.isEnabled();
      
      if (!enabled) {
        setState((prev) => ({
          ...prev,
          isEnabled: false,
          error: 'Please enable NFC in your device settings',
        }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        isEnabled: true,
        error: null,
      }));
      
      return true;
    } catch (error) {
      log.error('Permission check failed:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to check NFC status',
      }));
      return false;
    }
  }, []);

  // Start scanning for NFC tags
  const startScan = useCallback(async () => {
    log.debug('startScan called');

    // Prevent concurrent scans
    if (isScanningRef.current) {
      log.debug('Scan already in progress, ignoring');
      return;
    }

    // Immediately set flag and state
    isScanningRef.current = true;
    setState((prev) => ({
      ...prev,
      status: 'checking',
      error: null,
      tagInfo: null,
      lastMessage: null,
    }));

    // Check permissions/enabled state
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      isScanningRef.current = false;
      setState((prev) => ({
        ...prev,
        status: 'idle',
      }));
      return;
    }

    // Create Deferred for scan completion
    const scanComplete = new Deferred<void, Error>();
    scanCompleteRef.current = scanComplete;

    try {
      setState((prev) => ({
        ...prev,
        status: 'scanning',
      }));

      log.info('Waiting for NFC tag...');

      // Reset timeout flag
      didTimeoutRef.current = false;

      // Set up timeout - will cancel the NFC request if no tag detected
      scanTimeoutRef.current = setTimeout(async () => {
        log.debug('Scan timeout reached, cancelling...');
        didTimeoutRef.current = true;
        try {
          await NfcManager.cancelTechnologyRequest();
        } catch (e) {
          // Ignore
        }
      }, SCAN_TIMEOUT);

      // Request NFC technology - this waits for a tag to be tapped
      // If timeout fires, cancelTechnologyRequest() will cause this to throw
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Clear timeout since tag was detected
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
      
      log.debug('Tag detected, reading...');

      // Get tag info
      const tag = await NfcManager.getTag();
      log.debug('Tag info:', tag);

      if (tag) {
        const tagInfo: NFCTagInfo = {
          id: tag.id || 'unknown',
          techTypes: tag.techTypes || [],
        };

        setState((prev) => ({
          ...prev,
          status: 'connected',
          tagInfo,
        }));

        log.info('NFC tag connected:', tagInfo.id);

        // Write dummy message to tag
        await writeToTag();
      }

      scanComplete.resolve();
    } catch (error) {
      log.warn('NFC scan error:', error);

      // Clear timeout if it's still pending
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
      
      // Check error type
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isCancelled = errorMessage.includes('cancelled') || 
                          errorMessage.includes('canceled') ||
                          errorMessage.includes('user');

      if (didTimeoutRef.current) {
        // Timeout triggered the cancellation
        setState((prev) => ({
          ...prev,
          status: 'idle',
          error: 'No NFC tag detected. Please try again.',
        }));
      } else if (isCancelled) {
        // User cancelled
        setState((prev) => ({
          ...prev,
          status: 'idle',
        }));
      } else {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: 'Failed to read NFC tag. Please try again.',
        }));
      }

      scanComplete.reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      // Always cleanup
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (e) {
        log.debug('Cancel technology request error (ignored):', e);
      }
      isScanningRef.current = false;
      scanCompleteRef.current = null;
    }
  }, [requestPermissions]);

  // Write message to NFC tag
  const writeToTag = useCallback(async () => {
    if (isWritingRef.current) {
      log.debug('Already writing, ignoring');
      return;
    }

    isWritingRef.current = true;
    setState((prev) => ({
      ...prev,
      status: 'writing',
    }));

    try {
      log.debug('Writing message to tag:', DUMMY_MESSAGE);

      // Create NDEF message with text record
      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(DUMMY_MESSAGE),
      ]);

      if (!bytes) {
        throw new Error('Failed to encode NDEF message');
      }

      // Retry logic for write operations (tag may need time to stabilize)
      let lastError: Error | null = null;
      for (let attempt = 0; attempt <= WRITE_RETRY_COUNT; attempt++) {
        try {
          if (attempt > 0) {
            log.debug(`Write retry attempt ${attempt}/${WRITE_RETRY_COUNT}`);
            // Small delay before retry
            await new Promise(resolve => setTimeout(resolve, WRITE_RETRY_DELAY));
          }
          await NfcManager.ndefHandler.writeNdefMessage(bytes);
          log.info('Successfully wrote message to NFC tag');

          setState((prev) => ({
            ...prev,
            status: 'connected',
            lastMessage: DUMMY_MESSAGE,
          }));
          return; // Success, exit
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e));
          log.warn(`Write attempt ${attempt + 1} failed:`, lastError.message);
        }
      }

      // All retries failed
      throw lastError || new Error('Failed to write to NFC tag');
    } catch (error) {
      log.error('Failed to write to NFC tag:', error);
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Failed to write to NFC tag. Keep the tag close and try again.',
      }));
    } finally {
      isWritingRef.current = false;
    }
  }, []);

  // Stop scanning
  const stopScan = useCallback(async () => {
    log.debug('stopScan called');

    // Clear timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (e) {
      log.debug('Cancel technology request error (ignored):', e);
    }

    isScanningRef.current = false;
    setState((prev) => ({
      ...prev,
      status: 'idle',
      error: null,
    }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    log.debug('reset called');
    
    stopScan();
    setState({
      ...initialState,
      isSupported: state.isSupported,
      isEnabled: state.isEnabled,
    });
  }, [stopScan, state.isSupported, state.isEnabled]);

  return {
    ...state,
    startScan,
    stopScan,
    reset,
    requestPermissions,
  };
}
