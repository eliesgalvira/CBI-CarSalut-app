import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme';

interface ExpandableSectionProps {
  title: string;
  expanded?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}

export function ExpandableSection({
  title,
  expanded = false,
  onToggle,
  children,
}: ExpandableSectionProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.chevronWrap}>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={T.textSoft}
          />
        </View>
      </TouchableOpacity>
      {expanded && children && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: T.bgCard,
    borderRadius: T.r.lg,
    borderWidth: 1,
    borderColor: T.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  title: {
    color: T.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: T.r.sm,
    backgroundColor: T.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
});
