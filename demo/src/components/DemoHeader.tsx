import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDemoState } from '../context/DemoStateContext';

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
  
  // Get first letter of user's name, or fallback to "?"
  const profileInitial = state.userName ? state.userName.charAt(0).toUpperCase() : '?';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {/* Left side - Logo or Back */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoContainer}>
              <Ionicons name="eye-outline" size={24} color="#fff" />
              <Text style={styles.logoText}>CarSight</Text>
            </View>
          )}
        </View>

        {/* Center - Title or Car Dropdown */}
        <View style={styles.centerSection}>
          {title ? (
            <Text style={styles.title}>{title}</Text>
          ) : showCarDropdown && carName ? (
            <TouchableOpacity style={styles.carDropdown} onPress={onCarDropdownPress}>
              <Text style={styles.carDropdownText}>{carName}</Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Right side - Profile badge with initial */}
        <View style={styles.rightSection}>
          <View style={styles.adBadge}>
            <Text style={styles.adText}>{profileInitial}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0f',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  carDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  carDropdownText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adBadge: {
    backgroundColor: '#8b5cf6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
