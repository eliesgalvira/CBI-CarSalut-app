import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { DemoNavigator } from './src/DemoNavigator';
import { DialogProvider } from './src/context/DialogContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <DialogProvider>
        <NavigationContainer>
          <DemoNavigator />
        </NavigationContainer>
      </DialogProvider>
    </SafeAreaProvider>
  );
}
