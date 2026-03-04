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
const androidIcons = {
  home: {
    active: require('../assets/tabs/home-active.png'),
    inactive: require('../assets/tabs/home-inactive.png'),
  },
  health: {
    active: require('../assets/tabs/health-active.png'),
    inactive: require('../assets/tabs/health-inactive.png'),
  },
  update: {
    active: require('../assets/tabs/update-active.png'),
    inactive: require('../assets/tabs/update-inactive.png'),
  },
  car: {
    active: require('../assets/tabs/car-active.png'),
    inactive: require('../assets/tabs/car-inactive.png'),
  },
  profile: {
    active: require('../assets/tabs/profile-active.png'),
    inactive: require('../assets/tabs/profile-inactive.png'),
  },
};

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

function tabIcon(
  filled: string,
  outline: string,
  android: { active: any; inactive: any },
) {
  return ({ focused }: { focused: boolean }) => {
    if (Platform.OS === 'ios') {
      return {
        sfSymbol: (focused ? filled : outline) as any,
      };
    }

    return focused ? android.active : android.inactive;
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
          tabBarIcon: tabIcon('house.fill', 'house', androidIcons.home),
        }}
      />
      <Tab.Screen
        name="ConditionTab"
        component={ConditionStackNavigator}
        options={{
          tabBarLabel: 'Health',
          tabBarIcon: tabIcon('waveform.path.ecg', 'waveform.path.ecg', androidIcons.health),
        }}
      />
      <Tab.Screen
        name="UpdateTab"
        component={UpdateStackNavigator}
        options={{
          tabBarLabel: 'Update',
          tabBarIcon: tabIcon('icloud.and.arrow.up.fill', 'icloud.and.arrow.up', androidIcons.update),
        }}
      />
      <Tab.Screen
        name="YourCarTab"
        component={YourCarStackNavigator}
        options={{
          tabBarLabel: 'My Car',
          tabBarIcon: tabIcon('car.fill', 'car', androidIcons.car),
        }}
      />
      <Tab.Screen
        name="DriverTab"
        component={DriverStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: tabIcon('person.fill', 'person', androidIcons.profile),
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
