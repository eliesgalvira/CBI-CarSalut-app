# CarSight Demo App

A standalone demo app for booth presentations showcasing the CarSight car health monitoring system.

## Features

- 🚗 **3 Car Profiles**: SEAT Ibiza 2020, CUPRA Formentor 2022, SEAT Leon 2019
- 📊 **Health Monitoring**: Animated circular gauge showing car condition percentage
- 🔄 **NFC Sync Simulation**: Cycles through health states on each sync
- 🔧 **Maintenance Guides**: Oil, Water, Tires, Water Pump, Mandatory Checks (ITV)
- 📱 **5-Tab Navigation**: Home, Condition, Update, Your Car, Driver

## Sync Cycle Behavior

The demo simulates NFC sync with the following progression:

1. **1st Sync**: Shows initial car health
2. **2nd Sync**: Health decreases by 2%
3. **3rd Sync**: Health increases by 5%
4. **4th Sync**: Resets to initial state

## Project Structure

```
demo/
├── App.tsx              # App entry point
├── app.json             # Expo configuration
├── package.json         # Dependencies
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ActionCard.tsx
│   │   ├── CarDropdown.tsx
│   │   ├── DemoButton.tsx
│   │   ├── DemoHeader.tsx
│   │   ├── ExpandableSection.tsx
│   │   ├── HealthBar.tsx
│   │   ├── HealthCircle.tsx
│   │   ├── ImprovementCard.tsx
│   │   └── InfoGrid.tsx
│   ├── context/
│   │   └── DemoStateContext.tsx  # State management
│   ├── data/
│   │   └── carProfiles.ts        # Car data & maintenance info
│   ├── screens/
│   │   ├── ConditionScreen.tsx
│   │   ├── DemoHomeScreen.tsx
│   │   ├── DriverScreen.tsx
│   │   ├── MandatoryChecksScreen.tsx
│   │   ├── OilDetailScreen.tsx
│   │   ├── TiresDetailScreen.tsx
│   │   ├── UpdateScreen.tsx
│   │   ├── WaterDetailScreen.tsx
│   │   ├── WaterPumpDetailScreen.tsx
│   │   └── YourCarScreen.tsx
│   ├── DemoNavigator.tsx         # Navigation setup
│   └── types.ts                  # TypeScript interfaces
```

## Setup

```bash
cd demo

# Install dependencies
npm install

# Prebuild native code
npx expo prebuild --clean

# Run on Android
npx expo run:android

# Or run on iOS
npx expo run:ios
```

## Development

```bash
cd demo

# Start Metro bundler
npx expo start --dev-client --clear
```

### Random Sync Fallback

If you do not have NFC tags available, you can enable a terminal flag that makes the `Sync to Upload` button load a random car profile instead of waiting for NFC.

Enable it:

```bash
cd demo
EXPO_PUBLIC_RANDOM_SYNC_FALLBACK=1 npx expo start --dev-client --clear
```

Disable it:

```bash
cd demo
npx expo start --dev-client --clear
```

When the flag is enabled, each tap on `Sync to Upload` picks one car profile at random for testing.

## NFC Tag Configuration

For real NFC functionality, program tags with values "1", "2", or "3" to load different car profiles:

| Tag Value | Car Profile |
|-----------|-------------|
| 1 | SEAT Ibiza 2020 |
| 2 | CUPRA Formentor 2022 |
| 3 | SEAT Leon 2019 |

## Tech Stack

- React Native 0.83.2 with Expo 55
- React Navigation (Native Bottom Tabs + Native Stack)
- React Native Reanimated (animations)
- React Native SVG (health gauge)
- @expo/vector-icons (Ionicons)
- @expo/ui (Jetpack Compose AlertDialog)
