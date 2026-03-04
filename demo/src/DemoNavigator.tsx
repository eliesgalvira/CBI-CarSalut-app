import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from './theme';

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

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={DemoHomeScreen} />
    </HomeStack.Navigator>
  );
}

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

function UpdateStackNavigator() {
  return (
    <UpdateStack.Navigator screenOptions={{ headerShown: false }}>
      <UpdateStack.Screen name="Update" component={UpdateScreen} />
      <UpdateStack.Screen name="PhotoRegister" component={PhotoRegisterScreen} />
    </UpdateStack.Navigator>
  );
}

function YourCarStackNavigator() {
  return (
    <YourCarStack.Navigator screenOptions={{ headerShown: false }}>
      <YourCarStack.Screen name="YourCar" component={YourCarScreen} />
    </YourCarStack.Navigator>
  );
}

function DriverStackNavigator() {
  return (
    <DriverStack.Navigator screenOptions={{ headerShown: false }}>
      <DriverStack.Screen name="Driver" component={DriverScreen} />
    </DriverStack.Navigator>
  );
}

function TabIcon({ name, color, size, focused }: { name: string; color: string; size: number; focused: boolean }) {
  return (
    <View style={focused ? styles.activeIconWrap : undefined}>
      <Ionicons name={name as any} size={size - 2} color={color} />
    </View>
  );
}

function DemoMainNavigator() {
  const { isInitialized } = useDemoState();
  const insets = useSafeAreaInsets();

  if (!isInitialized) {
    return <HomeStackNavigator />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, 10),
            height: 68 + insets.bottom,
          },
        ],
        tabBarActiveTintColor: T.accent,
        tabBarInactiveTintColor: T.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: { overflow: 'visible' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="home-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ConditionTab"
        component={ConditionStackNavigator}
        options={{
          tabBarLabel: 'Health',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="pulse-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="UpdateTab"
        component={UpdateStackNavigator}
        options={{
          tabBarLabel: 'Update',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="cloud-upload-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="YourCarTab"
        component={YourCarStackNavigator}
        options={{
          tabBarLabel: 'My Car',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="car-sport-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="DriverTab"
        component={DriverStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="person-outline" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function DemoNavigator() {
  return (
    <DemoStateProvider>
      <DemoMainNavigator />
    </DemoStateProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: T.bgCard,
    borderTopWidth: 1,
    borderTopColor: T.border,
    paddingTop: 6,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  tabItem: {
    paddingVertical: 2,
  },
  activeIconWrap: {
    backgroundColor: T.accentDim,
    borderRadius: T.r.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});
