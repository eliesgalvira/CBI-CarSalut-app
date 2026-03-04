import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme';

interface DemoButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const variants = {
  primary: {
    bg: T.accent,
    border: T.accent,
    text: '#fff',
  },
  secondary: {
    bg: T.accentDim,
    border: T.accentBorder,
    text: T.accent,
  },
  outline: {
    bg: 'transparent',
    border: T.borderLight,
    text: T.textSoft,
  },
};

export function DemoButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}: DemoButtonProps) {
  const v = variants[variant];

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.45 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && <Ionicons name={icon as any} size={18} color={v.text} style={styles.icon} />}
          <Text style={[styles.label, { color: v.text }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    paddingHorizontal: 24,
    borderRadius: T.r.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  icon: {},
});
