import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CarTagScreen, NFCScreen, RaceScreen } from './src/screens';

const Tab = createBottomTabNavigator();

// Simple icon components (no external dependencies)
function CarTagIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, { color }]}>📡</Text>
    </View>
  );
}

function NFCIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, { color }]}>📱</Text>
    </View>
  );
}

function RaceIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, { color }]}>🏁</Text>
    </View>
  );
}

function AppNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: Math.max(insets.bottom, 8), height: 60 + insets.bottom },
        ],
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
          <Tab.Screen
            name="CarTag"
            component={CarTagScreen}
            options={{
              tabBarIcon: ({ color }) => <CarTagIcon color={color} />,
            }}
          />
          <Tab.Screen
            name="NFC"
            component={NFCScreen}
            options={{
              tabBarIcon: ({ color }) => <NFCIcon color={color} />,
            }}
          />
          <Tab.Screen
            name="Race"
            component={RaceScreen}
            options={{
              tabBarIcon: ({ color }) => <RaceIcon color={color} />,
            }}
          />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0a0a0f',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
});

