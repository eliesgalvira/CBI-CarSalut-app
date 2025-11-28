# useBLE Hook Architecture

This document explains the architecture of the `useBLE` hook, which manages Bluetooth Low Energy (BLE) connections for the CarTag device.

## Overview

The `useBLE` hook provides a React-friendly interface to the complex, event-driven BLE APIs. It handles:
- Device scanning and discovery
- Connection management
- Service/characteristic discovery
- Data subscription (notifications)
- Automatic reconnection
- Error recovery with retries

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
1. Establishes BLE connection
2. Sets up disconnect listener (for auto-reconnect)
3. Discovers services and characteristics
4. Auto-subscribes to battery characteristic

### `attemptScan()` (internal)
1. Stops any existing scan (awaits Promise)
2. Adds delay on retries
3. Starts scan with callback
4. Returns Promise via Deferred pattern
5. Retries on "Cannot start scanning" error

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot start scanning operation" | BLE stack busy | Retry with backoff |
| "Bluetooth is turned off" | Adapter disabled | Show error to user |
| "Connection failed" | Device out of range | Auto-reconnect or show error |
| "Permissions required" | User denied | Prompt for permissions |

## Android-Specific Considerations

1. **Scan limits**: Android limits concurrent scans (~5). We ensure only one scan runs at a time.
2. **Location permission**: Required for BLE scanning on Android < 12.
3. **Stack settling time**: 1.5s delay after disconnect before scanning.
4. **Scan mode**: Using `LowLatency` for faster discovery.

## Future Improvements

1. **iOS background mode**: Add `restoreStateIdentifier` for background BLE
2. **Bonding**: Implement device bonding for faster reconnection
3. **MTU negotiation**: Request larger MTU for faster data transfer
4. **Connection timeout**: Add timeout for stuck connections
