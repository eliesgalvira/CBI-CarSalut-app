import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { DemoNavigator } from './src/DemoNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <DemoNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
