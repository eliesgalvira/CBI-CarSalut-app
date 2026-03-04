import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDemoState } from '../context/DemoStateContext';
import { T } from '../theme';

interface DemoHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  showCarDropdown?: boolean;
  carName?: string;
  onCarDropdownPress?: () => void;
}

export function DemoHeader({
  showBack = false,
  onBack,
  title,
  showCarDropdown = false,
  carName,
  onCarDropdownPress,
}: DemoHeaderProps) {
  const insets = useSafeAreaInsets();
  const { state } = useDemoState();

  const initial = state.userName ? state.userName.charAt(0).toUpperCase() : '?';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>  
      <View style={styles.row}>
        {/* Left */}
        <View style={styles.left}>
          {showBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.6}>
              <Ionicons name="chevron-back" size={24} color={T.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logo}>
              <View style={styles.logoIcon}>
                <Ionicons name="car-sport" size={18} color={T.accent} />
              </View>
              <Text style={styles.logoText}>CarSight</Text>
            </View>
          )}
        </View>

        {/* Center */}
        <View style={styles.center}>
          {title ? (
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          ) : showCarDropdown && carName ? (
            <TouchableOpacity style={styles.carPill} onPress={onCarDropdownPress} activeOpacity={0.7}>
              <Ionicons name="car-sport-outline" size={14} color={T.accent} />
              <Text style={styles.carPillText} numberOfLines={1}>{carName}</Text>
              <Ionicons name="chevron-down" size={14} color={T.textSoft} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Right */}
        <View style={styles.right}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: T.bg,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flex: 1, alignItems: 'flex-start' },
  center: { flex: 2, alignItems: 'center' },
  right: { flex: 1, alignItems: 'flex-end' },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: T.r.sm,
    backgroundColor: T.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: T.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: T.r.sm,
    backgroundColor: T.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: T.text,
    fontSize: 16,
    fontWeight: '700',
  },
  carPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: T.r.full,
    borderWidth: 1,
    borderColor: T.accentBorder,
    gap: 6,
    maxWidth: 200,
  },
  carPillText: {
    color: T.text,
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: T.r.full,
    backgroundColor: T.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
