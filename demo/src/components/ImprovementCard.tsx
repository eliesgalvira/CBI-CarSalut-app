import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaintenanceItem } from '../types';
import { T } from '../theme';

interface ImprovementCardProps {
  item: MaintenanceItem;
  onPress?: () => void;
}

export function ImprovementCard({ item, onPress }: ImprovementCardProps) {
  const warnColor =
    item.warningLevel === 'red' ? T.bad :
    item.warningLevel === 'yellow' ? T.warn : T.ok;

  const warnBg =
    item.warningLevel === 'red' ? T.badDim :
    item.warningLevel === 'yellow' ? T.warnDim : T.okDim;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Left accent strip */}
      <View style={[styles.strip, { backgroundColor: item.hasWarning ? warnColor : T.ok }]} />

      <View style={[styles.iconWrap, { backgroundColor: warnBg }]}>  
        <Ionicons name={item.icon as any} size={20} color={warnColor} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={[styles.sub, { color: item.hasWarning ? warnColor : T.textSoft }]}>
          {item.subtitle}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={T.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.bgCard,
    borderRadius: T.r.lg,
    borderWidth: 1,
    borderColor: T.border,
    padding: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  strip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: T.r.lg,
    borderBottomLeftRadius: T.r.lg,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: T.r.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  body: { flex: 1 },
  title: {
    color: T.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sub: {
    fontSize: 12,
    marginTop: 3,
  },
});
