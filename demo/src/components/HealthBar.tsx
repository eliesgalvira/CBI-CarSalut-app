import React from 'react';
import { View, StyleSheet } from 'react-native';

interface HealthBarProps {
  percentage: number;
  height?: number;
}

export function HealthBar({ percentage, height = 8 }: HealthBarProps) {
  const greenWidth = Math.min(100, Math.max(0, percentage));
  const redWidth = 100 - greenWidth;

  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.greenBar, { flex: greenWidth }]} />
      <View style={[styles.redBar, { flex: redWidth }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  greenBar: {
    backgroundColor: '#22C55E',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  redBar: {
    backgroundColor: '#EF4444',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
});
