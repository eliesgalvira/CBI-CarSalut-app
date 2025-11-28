import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { ConnectionStatus } from '../types';

interface StatusIndicatorProps {
  status: ConnectionStatus;
}

const statusConfig: Record<
  ConnectionStatus,
  { color: string; label: string; pulse: boolean }
> = {
  idle: { color: '#4a4a5e', label: 'Ready', pulse: false },
  scanning: { color: '#f59e0b', label: 'Scanning...', pulse: true },
  connecting: { color: '#3b82f6', label: 'Connecting...', pulse: true },
  connected: { color: '#10b981', label: 'Connected', pulse: false },
  disconnected: { color: '#ef4444', label: 'Disconnected', pulse: false },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const config = statusConfig[status];

  useEffect(() => {
    if (config.pulse) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [config.pulse, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: config.color },
          { transform: [{ scale: pulseAnim }] },
        ]}
      />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

