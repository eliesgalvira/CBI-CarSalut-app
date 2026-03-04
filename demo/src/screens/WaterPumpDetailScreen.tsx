import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, DemoButton } from '../components';
import { useDemoState } from '../context/DemoStateContext';
import { MAINTENANCE_GUIDES } from '../data/carProfiles';
import { T } from '../theme';

export function WaterPumpDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { selectedCar } = useDemoState();
  const guide = MAINTENANCE_GUIDES.waterPump;

  return (
    <View style={[s.screen, { paddingBottom: insets.bottom }]}>
      <DemoHeader showBack onBack={() => navigation.goBack()} />
      <ScrollView style={s.scroll} contentContainerStyle={s.inner}>
        {/* Title */}
        <View style={s.titleRow}>
          <View style={s.titleIcon}><Ionicons name="cog-outline" size={20} color={T.accent} /></View>
          <Text style={s.title}>{guide.title}</Text>
        </View>

        {/* Warning */}
        <View style={[s.alert, { backgroundColor: T.warnDim }]}>
          <Ionicons name="alert-circle" size={18} color={T.warn} />
          <Text style={[s.alertText, { color: T.warn }]}>Over 20,000 km since last inspection</Text>
        </View>

        <Text style={s.rec}>
          The water pump on your {selectedCar?.brand} {selectedCar?.model} should be inspected {guide.interval}.
        </Text>

        {/* Status Card */}
        <View style={s.card}>
          <StatusRow label="Current Mileage" value={`${(selectedCar?.kilometers ?? 0).toLocaleString()} km`} />
          <StatusRow label="Last Inspection" value="N/A" warn />
          <StatusRow label="Typical Lifespan" value="60,000 – 100,000 km" />
        </View>

        {/* Guide Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Guide</Text>
          <Text style={s.cardDesc}>{guide.recommendation}</Text>

          <Text style={s.subHead}>Signs of failure</Text>
          {['Coolant leaks under the vehicle', 'Whining or grinding noise from the engine', 'Engine overheating', 'Steam from the radiator', 'Coolant smell inside the car'].map((t, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={[s.numCircle, { backgroundColor: T.badDim }]}><Text style={[s.numText, { color: T.bad }]}>{i + 1}</Text></View>
              <Text style={s.bulletText}>{t}</Text>
            </View>
          ))}

          <Text style={[s.subHead, { marginTop: 16 }]}>Preventive measures</Text>
          {['Replace water pump with timing belt (same labor)', 'Use manufacturer-recommended coolant', 'Regular coolant system inspections'].map((t, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={s.bullet} />
              <Text style={s.bulletText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Cost Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Estimated Cost</Text>
          <View style={s.costBox}>
            <Text style={s.costValue}>€ 250 – 500</Text>
            <Text style={s.costNote}>Parts + Labor</Text>
          </View>
        </View>

        {/* Garages */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Nearby Garages</Text>
          <Text style={s.cardDesc}>Water pump replacement requires professional service.</Text>
          <GarageRow name={`${selectedCar?.brand ?? 'Brand'} Official Service`} dist="2.1 km" />
          <GarageRow name="MecaniCar Pro" dist="3.4 km" />
        </View>

        <View style={s.btns}>
          <DemoButton label="Upload Update" icon="add-circle-outline" onPress={() => Alert.alert('Upload', 'This would open the upload dialog')} variant="outline" />
        </View>
      </ScrollView>
    </View>
  );
}

function StatusRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={s.sRow}>
      <Text style={s.sLabel}>{label}</Text>
      <Text style={[s.sValue, warn && { color: T.warn }]}>{value}</Text>
    </View>
  );
}

function GarageRow({ name, dist }: { name: string; dist: string }) {
  return (
    <View style={s.garageRow}>
      <View style={s.garageIcon}><Ionicons name="location-outline" size={16} color={T.accent} /></View>
      <Text style={s.garageName}>{name}</Text>
      <Text style={s.garageDist}>{dist}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 20, paddingBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 14 },
  titleIcon: { width: 40, height: 40, borderRadius: T.r.sm, backgroundColor: T.accentDim, alignItems: 'center', justifyContent: 'center' },
  title: { color: T.text, fontSize: 20, fontWeight: '700' },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: T.r.md, marginBottom: 18 },
  alertText: { fontSize: 13, fontWeight: '600', flex: 1 },
  rec: { color: T.textSoft, fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 24, paddingHorizontal: 8 },

  card: { backgroundColor: T.bgCard, borderRadius: T.r.lg, borderWidth: 1, borderColor: T.border, padding: 22, marginBottom: 16 },
  cardTitle: { color: T.accent, fontSize: 14, fontWeight: '700', letterSpacing: 0.4, marginBottom: 10 },
  cardDesc: { color: T.textSoft, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  subHead: { color: T.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  numCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: 11, fontWeight: '700' },
  bullet: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: T.accent },
  bulletText: { color: T.text, fontSize: 13, flex: 1 },

  costBox: { backgroundColor: T.bgElevated, borderRadius: T.r.md, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: T.accent },
  costValue: { color: T.accent, fontSize: 22, fontWeight: '800' },
  costNote: { color: T.textSoft, fontSize: 12, marginTop: 4 },

  sRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: T.border },
  sLabel: { color: T.textSoft, fontSize: 13 },
  sValue: { color: T.text, fontSize: 13, fontWeight: '600' },

  garageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  garageIcon: { width: 32, height: 32, borderRadius: T.r.sm, backgroundColor: T.accentDim, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  garageName: { color: T.text, fontSize: 14, fontWeight: '500', flex: 1 },
  garageDist: { color: T.ok, fontSize: 12, fontWeight: '600' },
  btns: { gap: 12, marginTop: 8 },
});
