import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDemoState } from '../context/DemoStateContext';
import { DemoHeader, HealthBar, InfoGrid, ExpandableSection, DemoButton } from '../components';
import { T, healthColor } from '../theme';

export function YourCarScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { state, selectedCar } = useDemoState();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }));
  const color = healthColor(state.currentHealth);

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <DemoHeader showBack onBack={() => navigation.goBack()} showCarDropdown carName={selectedCar?.name} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        {/* Top hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.carIconBig}>
              <Text style={{ fontSize: 48 }}>🚗</Text>
            </View>
            <View style={styles.heroStats}>
              <Text style={styles.condLabel}>CONDITION</Text>
              <View style={styles.pctRow}>
                <Text style={[styles.pct, { color }]}>{Math.round(state.currentHealth)}</Text>
                <Text style={[styles.pctSign, { color }]}>%</Text>
              </View>
            </View>
          </View>
          <HealthBar percentage={state.currentHealth} height={8} />
          <View style={styles.syncRow}>
            <Text style={styles.syncText}>Last sync: {state.lastSyncDate}</Text>
            <Text style={styles.verifiedText}>Verified: {selectedCar?.verifiedHistory}%</Text>
          </View>
        </View>

        {/* Info */}
        <Text style={styles.sectionTitle}>General Information</Text>
        {selectedCar && <InfoGrid car={selectedCar} />}

        {/* Expandable sections */}
        <View style={styles.sections}>
          <ExpandableSection title="Maintenance History" expanded={expanded.maint} onToggle={() => toggle('maint')}>
            <HistoryRow date="15.10.2024" type="Oil Change" place="Taller Mecánico García" />
            <HistoryRow date="03.05.2024" type="Tire Rotation" place="AutoService Pro" />
            <HistoryRow date="28.12.2023" type="ITV Inspection" place="ITV Barcelona" />
          </ExpandableSection>

          <ExpandableSection title="Driving History" expanded={expanded.driving} onToggle={() => toggle('driving')}>
            <View style={styles.statsRow}>
              <StatBubble value={selectedCar?.kilometers.toLocaleString() ?? '0'} label="Total KM" />
              <StatBubble value="4.2" label="Avg Rating" />
              <StatBubble value="12" label="Trips" />
            </View>
          </ExpandableSection>

          <ExpandableSection title="Related Garages" expanded={expanded.garages} onToggle={() => toggle('garages')}>
            <GarageRow name="Taller Mecánico García" addr="Carrer de Balmes 123, Barcelona" rating="4.5" />
            <GarageRow name="AutoService Pro" addr="Av. Diagonal 456, Barcelona" rating="4.8" />
          </ExpandableSection>
        </View>

        <DemoButton label="Transfer Car" onPress={() => {}} variant="primary" style={styles.transferBtn} />
      </ScrollView>
    </View>
  );
}

/* ── Inline sub-components ───────────────────────────────── */
function HistoryRow({ date, type, place }: { date: string; type: string; place: string }) {
  return (
    <View style={iStyles.hRow}>
      <Text style={iStyles.hDate}>{date}</Text>
      <Text style={iStyles.hType}>{type}</Text>
      <Text style={iStyles.hPlace}>{place}</Text>
    </View>
  );
}

function StatBubble({ value, label }: { value: string; label: string }) {
  return (
    <View style={iStyles.stat}>
      <Text style={iStyles.statVal}>{value}</Text>
      <Text style={iStyles.statLbl}>{label}</Text>
    </View>
  );
}

function GarageRow({ name, addr, rating }: { name: string; addr: string; rating: string }) {
  return (
    <View style={iStyles.garage}>
      <Text style={iStyles.gName}>{name}</Text>
      <Text style={iStyles.gAddr}>{addr}</Text>
      <Text style={iStyles.gRating}>★ {rating}</Text>
    </View>
  );
}

const iStyles = StyleSheet.create({
  hRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.border },
  hDate: { color: T.textMuted, fontSize: 11 },
  hType: { color: T.text, fontSize: 14, fontWeight: '600', marginTop: 2 },
  hPlace: { color: T.accent, fontSize: 12, marginTop: 2 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { color: T.text, fontSize: 22, fontWeight: '700' },
  statLbl: { color: T.textSoft, fontSize: 11, marginTop: 4 },
  garage: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  gName: { color: T.text, fontSize: 14, fontWeight: '600' },
  gAddr: { color: T.textSoft, fontSize: 12, marginTop: 2 },
  gRating: { color: T.warn, fontSize: 12, marginTop: 4 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 20, paddingBottom: 28 },

  heroCard: {
    backgroundColor: T.bgCard, borderRadius: T.r.lg,
    borderWidth: 1, borderColor: T.border, padding: 20, marginTop: 12,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  carIconBig: { flex: 1 },
  heroStats: { alignItems: 'flex-end' },
  condLabel: { color: T.textSoft, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  pctRow: { flexDirection: 'row', alignItems: 'flex-end' },
  pct: { fontSize: 44, fontWeight: '200' },
  pctSign: { fontSize: 18, fontWeight: '300', marginBottom: 8, marginLeft: 2 },
  syncRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  syncText: { color: T.textMuted, fontSize: 11 },
  verifiedText: { color: T.ok, fontSize: 11, fontWeight: '600' },

  sectionTitle: { color: T.accent, fontSize: 13, fontWeight: '700', letterSpacing: 0.6, marginTop: 24, marginBottom: 12, textTransform: 'uppercase' },
  sections: { marginTop: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  transferBtn: { marginTop: 24 },
});
