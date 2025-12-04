import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, DemoButton } from '../components';
import { useDemoState } from '../context/DemoStateContext';

export function DriverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state } = useDemoState();

  const displayName = state.userName || 'Driver';

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <DemoHeader />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#64748b" />
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Cars</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Syncs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2.4</Text>
              <Text style={styles.statLabel}>Years</Text>
            </View>
          </View>
        </View>
        
        {/* Menu Items */}
        <View style={styles.menuSection}>
          <MenuItem icon="person-outline" label="Edit Profile" />
          <MenuItem icon="notifications-outline" label="Notifications" />
          <MenuItem icon="settings-outline" label="Settings" />
          <MenuItem icon="shield-checkmark-outline" label="Privacy" />
          <MenuItem icon="help-circle-outline" label="Help & Support" />
          <MenuItem icon="information-circle-outline" label="About CarSight" />
        </View>
        
        {/* Logout */}
        <DemoButton
          label="Log Out"
          onPress={() => {}}
          variant="outline"
          style={styles.logoutButton}
        />
        
        {/* Version */}
        <Text style={styles.version}>Version 1.0.0 (Demo)</Text>
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.menuItem}>
      <Ionicons name={icon as any} size={22} color="#94a3b8" />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#64748b" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuSection: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    marginTop: 32,
  },
  version: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});
