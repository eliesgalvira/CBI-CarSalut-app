import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaintenanceItem } from '../types';

interface ImprovementCardProps {
  item: MaintenanceItem;
  onPress?: () => void;
}

export function ImprovementCard({ item, onPress }: ImprovementCardProps) {
  const getWarningColor = () => {
    switch (item.warningLevel) {
      case 'red':
        return '#EF4444';
      case 'yellow':
        return '#F59E0B';
      default:
        return 'transparent';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={24} color="#fff" />
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title}</Text>
          {item.hasWarning && (
            <View style={[styles.warningDot, { backgroundColor: getWarningColor() }]} />
          )}
        </View>
        <Text style={[styles.subtitle, item.hasWarning && { color: getWarningColor() }]}>
          {item.subtitle}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#64748b" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  warningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
});
