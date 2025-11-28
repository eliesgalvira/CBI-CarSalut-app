# BLE Heartbeat Monitor

A React Native (Expo) app that connects to a **CarSalut** ESP32 device via Bluetooth Low Energy and displays the heartbeat counter.

## Features

- 📡 BLE scanning for "CarSalut" device
- 🔗 Automatic connection and reconnection
- 📊 Real-time heartbeat counter display
- 🔍 Dynamic service/characteristic discovery
- 📱 Clean, modern dark UI

## Requirements

- Node.js 18+
- Android device connected via USB (for development)
- Android SDK installed at `/opt/android-sdk`
- ESP32 device named "CarSalut" broadcasting BLE data

## Setup

```bash
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

