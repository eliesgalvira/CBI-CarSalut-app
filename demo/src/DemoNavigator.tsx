import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Tab = createNativeBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ConditionStack = createNativeStackNavigator();
const UpdateStack = createNativeStackNavigator();
const YourCarStack = createNativeStackNavigator();
const DriverStack = createNativeStackNavigator();
const IoniconsNative = require('@expo/vector-icons/build/vendor/react-native-vector-icons/Ionicons');

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

function tabIcon(filled: string, outline: string, androidFilled: string, androidOutline: string) {
  return ({ focused }: { focused: boolean }) => {
    if (Platform.OS === 'ios') {
      return {
        sfSymbol: (focused ? filled : outline) as any,
      };
    }

    return IoniconsNative.getImageSourceSync(
      focused ? androidFilled : androidOutline,
      22,
      focused ? T.accent : T.textMuted,
    );
  };
}

function DemoMainNavigator() {
  const { isInitialized } = useDemoState();

  if (!isInitialized) {
    return <HomeStackNavigator />;
  }

  return (
    <Tab.Navigator
      tabBarActiveTintColor={T.accent}
      tabBarInactiveTintColor={T.textMuted}
      screenOptions={{
        tabBarActiveTintColor: T.accent,
        sceneStyle: styles.scene,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: tabIcon('house.fill', 'house', 'home', 'home-outline'),
        }}
      />
      <Tab.Screen
        name="ConditionTab"
        component={ConditionStackNavigator}
        options={{
          tabBarLabel: 'Health',
          tabBarIcon: tabIcon('waveform.path.ecg', 'waveform.path.ecg', 'pulse', 'pulse-outline'),
        }}
      />
      <Tab.Screen
        name="UpdateTab"
        component={UpdateStackNavigator}
        options={{
          tabBarLabel: 'Update',
          tabBarIcon: tabIcon('icloud.and.arrow.up.fill', 'icloud.and.arrow.up', 'cloud-upload', 'cloud-upload-outline'),
        }}
      />
      <Tab.Screen
        name="YourCarTab"
        component={YourCarStackNavigator}
        options={{
          tabBarLabel: 'My Car',
          tabBarIcon: tabIcon('car.fill', 'car', 'car-sport', 'car-sport-outline'),
        }}
      />
      <Tab.Screen
        name="DriverTab"
        component={DriverStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: tabIcon('person.fill', 'person', 'person', 'person-outline'),
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
  scene: { backgroundColor: T.bg },
});
