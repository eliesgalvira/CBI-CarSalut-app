import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { HeartbeatData } from '../types';

interface CounterDisplayProps {
  heartbeat: HeartbeatData | null;
}

export function CounterDisplay({ heartbeat }: CounterDisplayProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCounterRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      heartbeat &&
      prevCounterRef.current !== null &&
      heartbeat.counter !== prevCounterRef.current
    ) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCounterRef.current = heartbeat?.counter ?? null;
  }, [heartbeat?.counter, scaleAnim]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HEARTBEAT</Text>

      <Animated.View
        style={[styles.counterContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.counter}>
          {heartbeat ? heartbeat.counter.toLocaleString() : '—'}
        </Text>
      </Animated.View>

      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>LAST RECEIVED</Text>
          <Text style={styles.metaValue}>
            {heartbeat ? formatTime(heartbeat.timestamp) : '—'}
          </Text>
        </View>

        {heartbeat?.raw && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>RAW DATA</Text>
            <Text style={styles.metaValueMono} numberOfLines={1}>
              {heartbeat.raw}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: 4,
    marginBottom: 16,
  },
  counterContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingHorizontal: 48,
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginBottom: 32,
  },
  counter: {
    fontSize: 80,
    fontWeight: '200',
    color: '#f8fafc',
    fontVariant: ['tabular-nums'],
  },
  metaContainer: {
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  metaValueMono: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
    maxWidth: 200,
  },
});

