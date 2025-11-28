# BLE Heartbeat Monitor

A React Native (Expo) app that connects to a **CarTag** ESP32 device via Bluetooth Low Energy and displays battery percentage data.

## Features

- 📡 BLE scanning for "CarTag" device
- 🔗 Automatic connection and reconnection
- 🔋 Real-time battery percentage display with animated indicator
- 📱 Clean, modern dark UI

## Tech Stack

- React Native 0.81.5 with Expo 54
- React 19.1.0
- `react-native-ble-plx` v3.5.0 (patched for RN 0.80+ compatibility)
- ESP32 running PlatformIO firmware (in `cartag/` folder)

## Requirements

- Node.js 18+
- **JDK 17** (React Native requires JDK 17, not newer versions)
- Android device connected via USB (for development)
- Android SDK (typically at `~/Android/Sdk`)
- ESP32 device named "CarTag" broadcasting BLE data

## Setup

```bash
# Ensure JDK 17 is installed and set as default
java -version  # Should show 17.x.x

# Set environment variables (add to ~/.zshrc for persistence)
export ANDROID_HOME=$HOME/Android/Sdk
unset ANDROID_SDK_ROOT  # Remove conflicting variable if set

# Initialize ADB (ensure device is connected and authorized)
which adb && adb devices

# Install dependencies (patch-package runs automatically via postinstall)
npm install

# Prebuild native code (required for dev client)
npx expo prebuild --clean

# Run on Android
npx expo run:android
```

## Development

To start the development server with a dev client:

```bash
# Install dependencies
npm install

# Start Metro bundler with dev client and clear cache
npx expo start --dev-client --clear
```

Then scan the QR code with your development build or press `a` to open on a connected Android device.

## ESP32 Data Format

The app attempts to parse the heartbeat data in the following formats:

1. **Integer string**: `"42"` → counter = 42
2. **JSON object**: `{"counter": 42}` → counter = 42
3. **Embedded number**: `"beat:42"` → counter = 42

## Architecture

```
src/
├── components/
│   ├── ActionButton.tsx      # Reusable button component
│   ├── BatteryIndicator.tsx  # Animated circular battery display
│   ├── ServiceList.tsx       # BLE services/characteristics
│   └── StatusIndicator.tsx   # Connection status badge
├── hooks/
│   └── useBLE.ts             # BLE logic (scan, connect, subscribe)
└── types.ts                  # TypeScript interfaces
patches/
└── react-native-ble-plx+3.5.0.patch  # Critical bugfix for RN 0.80+
docs/
└── BLE-HOOK-ARCHITECTURE.md  # Detailed hook documentation
```

### Key Files

| File | Purpose |
|------|--------|
| `src/hooks/useBLE.ts` | BLE connection management - reusable hook |
| `src/types.ts` | TypeScript interfaces including `ConnectionStatus` |
| `App.tsx` | Main UI, uses `useBLE` hook |
| `patches/react-native-ble-plx+3.5.0.patch` | Critical bugfix for RN 0.80+ |

## Permissions

The app requests these permissions on Android:

- `BLUETOOTH_SCAN` (Android 12+)
- `BLUETOOTH_CONNECT` (Android 12+)
- `ACCESS_FINE_LOCATION` (required for BLE scanning)

## Patches

This project uses `patch-package` to fix a crash in `react-native-ble-plx` on React Native 0.80+. The patch is applied automatically during `npm install`. See `patches/` directory and [docs/BLE-HOOK-ARCHITECTURE.md](docs/BLE-HOOK-ARCHITECTURE.md) for details.

### Known Library Bug

`react-native-ble-plx` crashes with `NullPointerException` when a device disconnects during connection on RN 0.80.0+. Our patch fixes `SafePromise.java` to handle null error codes. This will be obsolete once [PR #1312](https://github.com/dotintent/react-native-ble-plx/pull/1312) is merged.

## Troubleshooting

### App crashes when device disconnects
1. Check if patch is applied: `ls patches/`
2. Run `npm install` (postinstall script applies patch)
3. Rebuild: `npx expo prebuild --clean && npx expo run:android`

### Scan never finds the device
1. Ensure ESP32 is powered on and advertising
2. Check device name in firmware matches "CarTag"
3. Verify Bluetooth is enabled on phone
4. Check logs for permission issues

### Connection succeeds but no data received
1. Verify UUIDs match between ESP32 firmware and app
2. Check if characteristic is notifiable
3. Look for "Subscribing to characteristic" in logs
4. Ensure ESP32 is sending notifications (not just readable data)

### Build fails after upgrading React Native
1. Check if `react-native-ble-plx` patch still applies
2. May need to regenerate patch for new RN version
3. Check if upstream fix (PR #1312) has been merged

