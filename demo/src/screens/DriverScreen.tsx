import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, DemoButton } from '../components';
import { useDemoState } from '../context/DemoStateContext';
import { T } from '../theme';

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'Edit Profile' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'settings-outline', label: 'Settings' },
  { icon: 'shield-checkmark-outline', label: 'Privacy' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
  { icon: 'information-circle-outline', label: 'About CarSight' },
] as const;

export function DriverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state } = useDemoState();
  const name = state.userName || 'Driver';

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <DemoHeader />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLg}>
            <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{name}</Text>

          <View style={styles.statsBar}>
            <Stat value="3" label="Cars" />
            <View style={styles.statDiv} />
            <Stat value="156" label="Syncs" />
            <View style={styles.statDiv} />
            <Stat value="2.4" label="Years" />
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity key={item.label} style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuRowBorder]} activeOpacity={0.6}>
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon as any} size={18} color={T.accent} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={T.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <DemoButton label="Log Out" onPress={() => {}} variant="outline" style={styles.logoutBtn} />
        <Text style={styles.version}>Version 1.0.0 (Demo)</Text>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 20, paddingBottom: 32 },

  profileCard: {
    alignItems: 'center', backgroundColor: T.bgCard,
    borderRadius: T.r.lg, borderWidth: 1, borderColor: T.border,
    paddingVertical: 28, paddingHorizontal: 20, marginTop: 12,
  },
  avatarLg: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  avatarLetter: { color: '#fff', fontSize: 28, fontWeight: '700' },
  userName: { color: T.text, fontSize: 22, fontWeight: '700' },

  statsBar: {
    flexDirection: 'row', alignItems: 'center', marginTop: 22,
    backgroundColor: T.bgElevated, borderRadius: T.r.md, padding: 18,
    alignSelf: 'stretch',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { color: T.text, fontSize: 20, fontWeight: '700' },
  statLbl: { color: T.textSoft, fontSize: 11, marginTop: 4 },
  statDiv: { width: 1, height: 32, backgroundColor: T.border },

  menuCard: {
    backgroundColor: T.bgCard, borderRadius: T.r.lg,
    borderWidth: 1, borderColor: T.border, marginTop: 20,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 18,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: T.border },
  menuIconWrap: {
    width: 34, height: 34, borderRadius: T.r.sm,
    backgroundColor: T.accentDim, alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: { flex: 1, color: T.text, fontSize: 15, fontWeight: '500' },

  logoutBtn: { marginTop: 28 },
  version: { color: T.textMuted, fontSize: 12, textAlign: 'center', marginTop: 16 },
});
