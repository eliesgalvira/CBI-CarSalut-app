import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DemoStateProvider, useDemoState } from './context/DemoStateContext';
import {
  DemoHomeScreen,
  ConditionScreen,
  YourCarScreen,
  UpdateScreen,
  DriverScreen,
  OilDetailScreen,
  WaterDetailScreen,
  TiresDetailScreen,
  MandatoryChecksScreen,
  WaterPumpDetailScreen,
  PhotoRegisterScreen,
} from './screens';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ConditionStack = createNativeStackNavigator();
const UpdateStack = createNativeStackNavigator();
const YourCarStack = createNativeStackNavigator();
const DriverStack = createNativeStackNavigator();

// Home Tab Stack
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={DemoHomeScreen} />
    </HomeStack.Navigator>
  );
}

// Condition Tab Stack (with detail screens)
function ConditionStackNavigator() {
  return (
    <ConditionStack.Navigator screenOptions={{ headerShown: false }}>
      <ConditionStack.Screen name="Condition" component={ConditionScreen} />
      <ConditionStack.Screen name="OilDetail" component={OilDetailScreen} />
      <ConditionStack.Screen name="WaterDetail" component={WaterDetailScreen} />
      <ConditionStack.Screen name="TiresDetail" component={TiresDetailScreen} />
      <ConditionStack.Screen name="MandatoryChecksDetail" component={MandatoryChecksScreen} />
      <ConditionStack.Screen name="WaterPumpDetail" component={WaterPumpDetailScreen} />
    </ConditionStack.Navigator>
  );
}

// Update Tab Stack
function UpdateStackNavigator() {
  return (
    <UpdateStack.Navigator screenOptions={{ headerShown: false }}>
      <UpdateStack.Screen name="Update" component={UpdateScreen} />
      <UpdateStack.Screen name="PhotoRegister" component={PhotoRegisterScreen} />
    </UpdateStack.Navigator>
  );
}

// Your Car Tab Stack
function YourCarStackNavigator() {
  return (
    <YourCarStack.Navigator screenOptions={{ headerShown: false }}>
      <YourCarStack.Screen name="YourCar" component={YourCarScreen} />
    </YourCarStack.Navigator>
  );
}

// Driver Tab Stack
function DriverStackNavigator() {
  return (
    <DriverStack.Navigator screenOptions={{ headerShown: false }}>
      <DriverStack.Screen name="Driver" component={DriverScreen} />
    </DriverStack.Navigator>
  );
}

// Tab Bar Icons
function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return <Ionicons name={name as any} size={size} color={color} />;
}

// Main Demo Navigator - switches between uninitialized (Stack only) and initialized (Tabs)
function DemoMainNavigator() {
  const { isInitialized } = useDemoState();
  const insets = useSafeAreaInsets();

  // When not initialized, only show home screen without tabs
  if (!isInitialized) {
    return <HomeStackNavigator />;
  }

  // When initialized, show full tab navigator
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { 
            paddingBottom: Math.max(insets.bottom, 8), 
            height: 70 + insets.bottom 
          },
        ],
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'HOME',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ConditionTab"
        component={ConditionStackNavigator}
        options={{
          tabBarLabel: 'CONDITION',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="build" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="UpdateTab"
        component={UpdateStackNavigator}
        options={{
          tabBarLabel: 'UPDATE',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="add-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="YourCarTab"
        component={YourCarStackNavigator}
        options={{
          tabBarLabel: 'YOUR CAR',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="car-sport-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="DriverTab"
        component={DriverStackNavigator}
        options={{
          tabBarLabel: 'DRIVER',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="speedometer-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Export the wrapped navigator with context provider
export function DemoNavigator() {
  return (
    <DemoStateProvider>
      <DemoMainNavigator />
    </DemoStateProvider>
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
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
});
