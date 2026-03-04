import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { DemoNavigator } from './src/DemoNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <DemoNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
