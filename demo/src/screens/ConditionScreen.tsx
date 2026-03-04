import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDemoState } from '../context/DemoStateContext';
import { DemoHeader, HealthBar, ImprovementCard } from '../components';
import { getMaintenanceItems } from '../data/carProfiles';
import { T, healthColor } from '../theme';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'recommended', label: 'Attention' },
] as const;

export function ConditionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state, selectedCar } = useDemoState();
  const [filterType, setFilterType] = useState('all');

  const items = getMaintenanceItems(state.metrics);
  const filtered =
    filterType === 'all' ? items :
    filterType === 'urgent' ? items.filter(i => i.warningLevel === 'red') :
    items.filter(i => i.warningLevel === 'yellow');

  const handleItemPress = (id: string) => {
    const map: Record<string, string> = {
      oil: 'OilDetail', water: 'WaterDetail', tires: 'TiresDetail',
      mandatoryChecks: 'MandatoryChecksDetail', waterPump: 'WaterPumpDetail',
    };
    if (map[id]) navigation.navigate(map[id]);
  };

  const color = healthColor(state.currentHealth);

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <DemoHeader showBack onBack={() => navigation.goBack()} showCarDropdown carName={selectedCar?.name} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        {/* Hero section */}
        <View style={styles.hero}>
          <Ionicons name="car-sport" size={52} color={T.textMuted} />
          <View style={styles.heroRight}>
            <Text style={[styles.heroPct, { color }]}>{Math.round(state.currentHealth)}</Text>
            <Text style={[styles.heroPctSign, { color }]}>%</Text>
          </View>
        </View>

        <View style={styles.barWrap}>
          <HealthBar percentage={state.currentHealth} height={10} />
          <Text style={styles.syncLabel}>Last sync: {state.lastSyncDate}</Text>
        </View>

        {/* Filter pills */}
        <View style={styles.pills}>
          {FILTERS.map(f => {
            const active = f.id === filterType;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setFilterType(f.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Items */}
        {filtered.map(item => (
          <ImprovementCard key={item.id} item={item} onPress={() => handleItemPress(item.id)} />
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="checkmark-circle-outline" size={40} color={T.ok} />
            <Text style={styles.emptyText}>No items match this filter</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 20, paddingBottom: 28 },

  hero: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginVertical: 20, gap: 24,
  },
  heroRight: { flexDirection: 'row', alignItems: 'flex-end' },
  heroPct: { fontSize: 52, fontWeight: '200', letterSpacing: -2 },
  heroPctSign: { fontSize: 22, fontWeight: '300', marginBottom: 10, marginLeft: 2 },

  barWrap: { marginBottom: 20 },
  syncLabel: { color: T.textMuted, fontSize: 11, marginTop: 8, letterSpacing: 0.3 },

  pills: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: T.r.full, backgroundColor: T.bgCard,
    borderWidth: 1, borderColor: T.border,
  },
  pillActive: { backgroundColor: T.accentDim, borderColor: T.accentBorder },
  pillText: { color: T.textSoft, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: T.accent },

  emptyWrap: { alignItems: 'center', marginTop: 40, gap: 12 },
  emptyText: { color: T.textSoft, fontSize: 14 },
});
