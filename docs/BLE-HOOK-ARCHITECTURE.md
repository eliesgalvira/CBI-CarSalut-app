# useBLE Hook Architecture

This document explains the architecture of the `useBLE` hook, a **reusable React hook** for managing Bluetooth Low Energy (BLE) connections.

## Overview

**Purpose:** Provide a React-friendly interface to complex, event-driven BLE APIs.

**Portability:** This hook can be adapted for any React Native project using `react-native-ble-plx`. Configure the constants at the top of the file for your device.

**Dependencies:**
- `react-native-ble-plx` (v3.x, requires patch on RN 0.80+)
- React 18+ with hooks

The hook provides a React-friendly interface to complex, event-driven BLE APIs. It handles:
- Device scanning and discovery
- Connection management with timeout protection
- Service/characteristic discovery
- Data subscription (notifications)
- Automatic reconnection
- Error recovery with retries
- GATT cache management

## Features

- ✅ **Deferred pattern** for clean async flow from event callbacks
- ✅ **Ref-based synchronization** prevents race conditions from rapid UI interactions
- ✅ **Retry logic with backoff** handles transient BLE stack errors
- ✅ **Disconnect-scan coordination** waits for BLE stack to settle
- ✅ **User-friendly error messages** translates technical errors
- ✅ **Dev/prod logging** verbose in development, minimal in production

## Configurable Constants

These values should be customized for your specific BLE device:

```typescript
// === CUSTOMIZE THESE FOR YOUR DEVICE ===
const TARGET_DEVICE_NAME = 'CarTag';           // Device name to search for
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

// === TIMING CONSTANTS (tune as needed) ===
const RECONNECT_DELAY = 3000;                  // 3s between reconnection attempts
const MAX_RECONNECT_ATTEMPTS = 5;              // Give up after 5 reconnect tries
const SCAN_TIMEOUT = 15000;                    // 15s scan timeout
const MAX_SCAN_RETRIES = 3;                    // Retry scan 3 times on failure
const CONNECTION_TIMEOUT = 10000;              // 10s connection timeout
```

## Logging Strategy

The hook uses a `log` helper that controls verbosity based on build type:

```typescript
const log = {
  debug: (...args: unknown[]) => __DEV__ && console.log('[BLE]', ...args),
  info: (...args: unknown[]) => console.log('[BLE]', ...args),
  warn: (...args: unknown[]) => __DEV__ && console.warn('[BLE]', ...args),
  error: (...args: unknown[]) => __DEV__ && console.error('[BLE]', ...args),
};
```

| Level | When to use | Shows in production? |
|-------|-------------|---------------------|
| `debug` | Verbose operational logs (state changes, retries) | No |
| `info` | Important events (connected, found device) | Yes |
| `warn` | Expected errors that are handled (retry errors) | No |
| `error` | Unexpected errors (for debugging) | No |

**Why?** Users shouldn't see scary ERROR messages for things that are handled internally (like scan retries). Only `info` level messages appear in production builds.

## Key Design Patterns

### 1. The Deferred Pattern

The **Deferred pattern** converts event-driven APIs into Promise-based ones. This is particularly useful when you need to resolve/reject a Promise from outside its executor function.

```typescript
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
      // ... similar for reject
    });
  }
}
```

**Why use Deferred?**
- BLE operations are event-driven (callbacks), but we want Promise-based flow
- Multiple events might try to resolve the same operation (Deferred handles idempotency)
- We need to resolve from different code paths (success callback, error callback, timeout)

**Where it's used:**
1. **`disconnectCompleteRef`**: Allows `startScan()` to wait for a pending disconnect to fully complete before scanning
2. **`scanStarted` (in attemptScan)**: Converts the scan callback into a Promise that resolves when scan starts successfully or fails

### 2. State Synchronization via Refs

React state updates are asynchronous, but BLE operations need immediate synchronization. We use refs for critical flags:

```typescript
const isScanningRef = useRef(false);        // Prevents concurrent scans
const isDisconnectingRef = useRef(false);   // Prevents reconnection during disconnect
const isReconnectingRef = useRef(false);    // Prevents multiple reconnection attempts
```

**Why refs instead of state?**
- Refs update synchronously (no re-render delay)
- Multiple rapid button presses would queue up operations if using state
- BLE operations check these flags immediately, not after next render

### 3. Retry Logic with Exponential Backoff

Android's BLE stack can temporarily refuse scan operations. We handle this with retries:

```typescript
const extraDelay = scanRetryCountRef.current * 200; // 0ms, 200ms, 400ms, 600ms
```

**Retry flow:**
1. First attempt: No delay
2. On "Cannot start scanning" error: Stop scan, wait, retry
3. Each retry adds 200ms more delay
4. After `MAX_SCAN_RETRIES` (3), give up with user-friendly error

### 4. Disconnect-Scan Coordination

The trickiest part of BLE on Android is that disconnecting doesn't immediately free resources. Scanning too soon after disconnect causes "Cannot start scanning operation".

**Solution: Deferred-based waiting**

```typescript
// In disconnect():
const disconnectComplete = new Deferred<void, Error>();
disconnectCompleteRef.current = disconnectComplete;
// ... cleanup ...
setTimeout(() => {
  disconnectComplete.resolve();
  disconnectCompleteRef.current = null;
}, 1500);

// In startScan():
if (disconnectCompleteRef.current) {
  await disconnectCompleteRef.current.promise; // Actually waits!
}
```

This ensures `startScan()` waits for the BLE stack to settle, even if user taps Scan immediately after Disconnect.

### 5. Connection Timeout (Library Built-in)

Android's `device.connect()` can hang indefinitely if there's stale connection state. We use the library's built-in timeout:

```typescript
const CONNECTION_TIMEOUT = 10000; // 10 seconds

const connectedDevice = await device.connect({
  timeout: CONNECTION_TIMEOUT,
  refreshGatt: 'OnConnected', // Clear GATT cache
});
```

**Why NOT use `Promise.race` with manual timeout?**

`react-native-ble-plx` has a bug where calling `device.cancelConnection()` during certain error states causes a crash:
```
java.lang.NullPointerException: Parameter specified as non-null is null: 
method com.facebook.react.bridge.PromiseImpl.reject, parameter code
```

This happens when:
1. We start a connection with `Promise.race`
2. The ESP32 disconnects during the connection handshake
3. Our timeout fires and we call `device.cancelConnection()`
4. The library tries to reject a Promise with a null error code → crash

**Safe approach:**
- Use the library's built-in `timeout` option - it handles cleanup internally
- Don't call `device.cancelConnection()` in error handlers
- Let the library manage its own state on connection failure

**Key features:**
- `refreshGatt: 'OnConnected'` clears Android's GATT cache, fixing stale connection issues
- Library handles timeout cleanup internally (no crash)
- 500ms settling delay after connection error before allowing retry

## State Machine

The hook manages these connection states:

```
┌─────────┐
│  idle   │ ← Initial state, no activity
└────┬────┘
     │ startScan() [SYNC: immediately sets preparing]
     ▼
┌──────────┐
│preparing │ ← Button disabled, waiting for cleanup
└────┬─────┘
     │ Permissions OK, scan started
     ▼
┌─────────┐
│scanning │ ← Looking for CarTag device
└────┬────┘
     │ Found device
     ▼
┌──────────┐
│connecting│ ← Establishing BLE connection
└────┬─────┘
     │ Connected + discovered services
     ▼
┌─────────┐
│connected│ ← Receiving data from device
└────┬────┘
     │ disconnect() or connection lost
     ▼
┌────────────┐
│disconnected│ ← Connection ended (may auto-reconnect)
└────────────┘
```

### The `preparing` State

The `preparing` state is critical for preventing multiple concurrent scans. When the user taps "Scan for Device":

1. **Synchronously** (before any `await`):
   - `isScanningRef.current = true`
   - `setState({ status: 'preparing' })`
2. The UI immediately sees `status === 'preparing'` and disables the button
3. **Then** async operations proceed (wait for disconnect, permissions, etc.)

This pattern ensures that even rapid button taps can't queue up multiple scans because:
- The ref check happens synchronously
- The state update happens in the same call stack (React will batch, but the ref is instant)
- By the time a second tap's handler runs, `isScanningRef.current` is already `true`

## Key Functions

### `startScan()`
1. Checks for pending disconnect (waits if needed)
2. Resets all flags
3. Requests permissions (Android)
4. Starts BLE scan with retry logic
5. On finding CarTag, calls `connectToDevice()`

### `disconnect()`
1. Creates Deferred for completion signaling
2. Stops any ongoing scan
3. Cancels BLE connection
4. Waits 1.5s for stack to settle
5. Resolves Deferred (allows pending scans to proceed)

### `connectToDevice()`
1. Establishes BLE connection with 10s timeout (library's built-in timeout)
2. Uses `refreshGatt: 'OnConnected'` to clear stale GATT cache
3. Sets up disconnect listener (for auto-reconnect)
4. Discovers services and characteristics
5. Auto-subscribes to battery characteristic
6. On failure, extracts error message safely from BleError objects
7. Does NOT call `cancelConnection()` in error handler (causes crash)
8. 500ms delay after error for BLE stack to settle

### `attemptScan()` (internal)
1. Stops any existing scan (awaits Promise)
2. Adds delay on retries
3. Starts scan with callback
4. Returns Promise via Deferred pattern
5. Retries on "Cannot start scanning" error

## Error Handling

### User-Facing Error Messages

The hook translates technical BLE errors into user-friendly messages:

| Technical Error | User Sees |
|----------------|-----------|
| "Cannot start scanning operation" | "Bluetooth is busy. Please wait a moment and try again." |
| "timeout" / "Timeout" | "Connection timed out. Make sure the device is nearby and try again." |
| "cancelled" / "Cancelled" | *(Nothing - expected behavior)* |
| "disconnected" (during connect) | "Device disconnected during connection. Please try again." |
| Scan timeout (no device found) | `"CarTag" not found. Make sure it's powered on and nearby.` |
| Bluetooth off | "Please turn on Bluetooth" |
| Permissions denied | "Bluetooth permissions are required" |

### Error Handling Table

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot start scanning operation" | BLE stack busy | Retry with backoff |
| "Bluetooth is turned off" | Adapter disabled | Show error to user |
| "Connection failed" | Device out of range | Auto-reconnect or show error |
| "Connection timeout" | Stale connection or device busy | Show error, user can retry (don't call cancelConnection!) |
| "Unknown error occurred" | Device disconnected during connect | Let library clean up, show error |
| "Permissions required" | User denied | Prompt for permissions |

### Known Library Bug: Null Error Code Crash

`react-native-ble-plx` can crash with `NullPointerException` when:
- Device disconnects during connection handshake
- Any BLE error occurs on React Native 0.80.0+

**Root cause:** The library calls `promise.reject(null, errorMessage)` in many places, but React Native 0.80.0+ requires non-null error codes.

**Solution:** We use `patch-package` to fix the library's `SafePromise.java`:

```java
// Before (crashes on RN 0.80+):
promise.reject(code, message);

// After (patched):
promise.reject(code != null ? code : "BLE_ERROR", message);
```

**Setup:**
1. `npm install patch-package --save-dev`
2. Patch file: `patches/react-native-ble-plx+3.5.0.patch`
3. `postinstall` script in `package.json` runs `patch-package` automatically

This patch will be obsolete once PR [#1312](https://github.com/dotintent/react-native-ble-plx/pull/1312) is merged.

## Android-Specific Considerations

1. **Scan limits**: Android limits concurrent scans (~5). We ensure only one scan runs at a time.
2. **Location permission**: Required for BLE scanning on Android < 12.
3. **Stack settling time**: 1.5s delay after disconnect before scanning.
4. **Scan mode**: Using `LowLatency` for faster discovery.
5. **GATT cache**: Android caches service/characteristic data. Use `refreshGatt: 'OnConnected'` to clear it when reconnecting to avoid stale data.
6. **Connection hanging**: `device.connect()` can hang indefinitely. Use the library's built-in `timeout` option.
7. **cancelConnection() bug**: Don't call `device.cancelConnection()` in error handlers - causes null pointer crash in `react-native-ble-plx` when device disconnected during connect.

## Future Improvements

1. **iOS background mode**: Add `restoreStateIdentifier` for background BLE
2. **Bonding**: Implement device bonding for faster reconnection
3. **MTU negotiation**: Request larger MTU for faster data transfer

---

## Appendix: Ref Variables

| Ref | Type | Purpose |
|-----|------|---------|
| `managerRef` | `BleManager` | Singleton BLE manager instance |
| `deviceRef` | `Device` | Currently connected device |
| `subscriptionRef` | `Subscription` | Active characteristic notification subscription |
| `disconnectListenerRef` | `Subscription` | Listener for unexpected disconnects |
| `isScanningRef` | `boolean` | Prevents concurrent scans (sync check) |
| `isDisconnectingRef` | `boolean` | Prevents reconnection during disconnect |
| `isReconnectingRef` | `boolean` | Prevents multiple reconnection attempts |
| `reconnectAttemptsRef` | `number` | Counter for reconnection attempts |
| `scanRetryCountRef` | `number` | Counter for scan retry attempts |
| `scanTimeoutRef` | `Timeout` | Scan timeout timer handle |
| `disconnectCompleteRef` | `Deferred` | Signals when disconnect is fully complete |

## Appendix: Hook Return Value

```typescript
return {
  // State
  status: ConnectionStatus,        // 'idle' | 'preparing' | 'scanning' | 'connecting' | 'connected' | 'disconnected'
  deviceName: string | null,       // Name of connected device
  deviceId: string | null,         // BLE ID of connected device
  heartbeat: HeartbeatData | null, // Latest received data
  error: string | null,            // User-facing error message
  services: DiscoveredService[],   // All discovered BLE services
  selectedCharacteristic: DiscoveredCharacteristic | null,
  
  // Actions
  startScan: () => Promise<void>,  // Start scanning for CarTag
  stopScan: () => Promise<void>,   // Cancel ongoing scan
  disconnect: () => Promise<void>, // Disconnect from device
  selectCharacteristic: (char) => Promise<void>, // Subscribe to a characteristic
  requestPermissions: () => Promise<boolean>,    // Request BLE permissions
};
```

## Adapting for Other Projects

To use this hook in another project:

1. **Copy the hook:** `src/hooks/useBLE.ts` and `src/types.ts`

2. **Configure constants:**
   ```typescript
   const TARGET_DEVICE_NAME = 'YourDeviceName';
   const SERVICE_UUID = 'your-service-uuid';
   const CHARACTERISTIC_UUID = 'your-characteristic-uuid';
   ```

3. **Apply the patch** (if using RN 0.80+):
   - Copy `patches/react-native-ble-plx+3.5.0.patch`
   - Add `patch-package` to devDependencies
   - Add `"postinstall": "patch-package"` to scripts

4. **Customize data parsing:** Modify `parseHeartbeatData()` for your data format
