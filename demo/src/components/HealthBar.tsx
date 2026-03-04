import React from 'react';
import { View, StyleSheet } from 'react-native';
import { T, healthColor } from '../theme';

interface HealthBarProps {
  percentage: number;
  height?: number;
}

export function HealthBar({ percentage, height = 8 }: HealthBarProps) {
  const width = Math.min(100, Math.max(0, percentage));
  const color = healthColor(percentage);

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>  
      <View
        style={[
          styles.fill,
          { width: `${width}%`, backgroundColor: color, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: T.bgElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
