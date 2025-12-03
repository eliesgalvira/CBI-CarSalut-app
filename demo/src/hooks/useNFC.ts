import { useCallback, useEffect, useRef, useState } from 'react';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

// Timeout for NFC scan (15 seconds)
const SCAN_TIMEOUT = 15000;

export type NFCStatus = 'idle' | 'checking' | 'scanning' | 'connected' | 'writing' | 'error';

export interface NFCTagInfo {
  id: string;
  techTypes: string[];
}

export interface NFCState {
  status: NFCStatus;
  isSupported: boolean;
  isEnabled: boolean;
  tagInfo: NFCTagInfo | null;
  lastMessage: string | null;
  error: string | null;
}

// Logging helper - verbose in dev, minimal in production
const log = {
  debug: (...args: unknown[]) => __DEV__ && console.log('[NFC]', ...args),
  info: (...args: unknown[]) => console.log('[NFC]', ...args),
  warn: (...args: unknown[]) => __DEV__ && console.warn('[NFC]', ...args),
  error: (...args: unknown[]) => __DEV__ && console.error('[NFC]', ...args),
};

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
  const didTimeoutRef = useRef(false);
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
      log.debug('Cleaning up NFC Manager...');
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  // Request NFC permission (Android only)
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      // Check if NFC is enabled
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

  // Read message from NFC tag
  const readTag = useCallback(async (): Promise<string | null> => {
    log.debug('readTag called');

    // Prevent concurrent scans
    if (isScanningRef.current) {
      log.debug('Scan already in progress, ignoring');
      return null;
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
      return null;
    }

    try {
      setState((prev) => ({
        ...prev,
        status: 'scanning',
      }));

      log.info('Waiting for NFC tag (read only)...');

      // Reset timeout flag
      didTimeoutRef.current = false;

      // Set up timeout
      scanTimeoutRef.current = setTimeout(async () => {
        log.debug('Read timeout reached, cancelling...');
        didTimeoutRef.current = true;
        try {
          await NfcManager.cancelTechnologyRequest();
        } catch (e) {
          // Ignore
        }
      }, SCAN_TIMEOUT);

      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Clear timeout since tag was detected
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
      
      log.debug('Tag detected, reading message...');

      // Get tag info
      const tag = await NfcManager.getTag();
      log.debug('Tag info:', tag);

      let readMessage: string | null = null;

      if (tag) {
        const tagInfo: NFCTagInfo = {
          id: tag.id || 'unknown',
          techTypes: tag.techTypes || [],
        };

        // Parse NDEF message if present
        if (tag.ndefMessage && tag.ndefMessage.length > 0) {
          try {
            const firstRecord = tag.ndefMessage[0];
            // Try to decode as text record
            if (firstRecord.payload && firstRecord.payload.length > 0) {
              // Text record format: [status byte (language code length)][language code][text]
              const payload = firstRecord.payload;
              const languageCodeLength = payload[0] & 0x3f;
              const textBytes = payload.slice(1 + languageCodeLength);
              readMessage = String.fromCharCode(...textBytes);
              log.info('Read message from tag:', readMessage);
            }
          } catch (parseError) {
            log.warn('Failed to parse NDEF message:', parseError);
          }
        }

        setState((prev) => ({
          ...prev,
          status: 'connected',
          tagInfo,
          lastMessage: readMessage,
        }));

        log.info('NFC tag read complete:', tagInfo.id);
      }

      return readMessage;
    } catch (error) {
      log.warn('NFC read error:', error);

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
        setState((prev) => ({
          ...prev,
          status: 'idle',
          error: 'No NFC tag detected. Please try again.',
        }));
      } else if (isCancelled) {
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

      return null;
    } finally {
      // Always cleanup
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (e) {
        log.debug('Cancel technology request error (ignored):', e);
      }
      isScanningRef.current = false;
    }
  }, [requestPermissions]);

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
    readTag,
    stopScan,
    reset,
    requestPermissions,
  };
}
