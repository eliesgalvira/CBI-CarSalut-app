# BLE Heartbeat Monitor

A React Native (Expo) app that connects to a **CarTag** ESP32 device via Bluetooth Low Energy and displays data.

## Features

- 📡 BLE scanning for "CarTag" device
- 🔗 Automatic connection and reconnection
- 📊 Real-time data display
- 📱 Clean, modern dark UI

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

# Install dependencies
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
│   ├── ActionButton.tsx    # Reusable button component
│   ├── CounterDisplay.tsx  # Large heartbeat counter
│   ├── ServiceList.tsx     # BLE services/characteristics
│   └── StatusIndicator.tsx # Connection status badge
├── hooks/
│   └── useBLE.ts           # BLE logic (scan, connect, subscribe)
└── types.ts                # TypeScript interfaces
```

## Permissions

The app requests these permissions on Android:

- `BLUETOOTH_SCAN` (Android 12+)
- `BLUETOOTH_CONNECT` (Android 12+)
- `ACCESS_FINE_LOCATION` (required for BLE scanning)

