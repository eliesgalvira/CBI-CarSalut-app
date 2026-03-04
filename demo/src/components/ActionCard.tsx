import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme';

interface ActionCardProps {
  icon: string;
  label: string;
  onPress?: () => void;
}

export function ActionCard({ icon, label, onPress }: ActionCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={28} color={T.accent} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    aspectRatio: 1.15,
    backgroundColor: T.bgCard,
    borderRadius: T.r.lg,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 14,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: T.r.md,
    backgroundColor: T.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  label: {
    color: T.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
