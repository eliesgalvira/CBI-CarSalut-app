import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, DemoButton } from '../components';
import { useDemoState } from '../context/DemoStateContext';
import { MAINTENANCE_GUIDES } from '../data/carProfiles';
import { T } from '../theme';
import { useDialog } from '../context/DialogContext';

export function TiresDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { showDialog } = useDialog();
  const { selectedCar } = useDemoState();
  const guide = MAINTENANCE_GUIDES.tires;

  return (
    <View style={[s.screen, { paddingBottom: insets.bottom }]}>
      <DemoHeader showBack onBack={() => navigation.goBack()} />
      <ScrollView style={s.scroll} contentContainerStyle={s.inner}>
        <View style={s.titleRow}>
          <View style={s.titleIcon}><Ionicons name="ellipse-outline" size={20} color={T.accent} /></View>
          <Text style={s.title}>{guide.title}</Text>
        </View>

        <View style={[s.alert, { backgroundColor: T.warnDim }]}>
          <Ionicons name="alert-circle" size={18} color={T.warn} />
          <Text style={[s.alertText, { color: T.warn }]}>Check air pressure</Text>
        </View>

        <Text style={s.rec}>
          Tire pressure for your {selectedCar?.brand} {selectedCar?.model} should be checked {guide.interval.toLowerCase()}.
        </Text>

        {/* Pressure card */}
        <View style={s.pressureCard}>
          <Text style={s.pressureTitle}>Recommended Pressure</Text>
          <View style={s.pressureRow}>
            <PressureItem label="Front" value="2.3 bar" />
            <View style={s.pressureDiv} />
            <PressureItem label="Rear" value="2.1 bar" />
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Maintenance Guide</Text>
          <Text style={s.cardDesc}>{guide.recommendation}</Text>
          <View style={s.steps}>
            {['Check pressure when tires are cold', 'Remove valve cap and attach gauge', 'Compare to recommended pressure (door jamb)', 'Add or release air as needed', 'Check tread depth — minimum 1.6mm', 'Look for uneven wear patterns'].map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                <Text style={s.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Nearby Tire Centers</Text>
          <Text style={s.cardDesc}>For rotation, balancing, or replacement.</Text>
          <GarageRow name="Michelin Center Barcelona" dist="1.2 km" />
          <GarageRow name="Norauto" dist="3.5 km" />
        </View>

        <View style={s.btns}>
          <DemoButton
            label="Upload Update"
            icon="add-circle-outline"
            onPress={() => showDialog({ title: 'Upload', message: 'This would open the upload dialog', buttons: [{ text: 'OK' }] })}
            variant="outline"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function PressureItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.pressureItem}>
      <Text style={s.pressureLbl}>{label}</Text>
      <Text style={s.pressureVal}>{value}</Text>
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

  pressureCard: { backgroundColor: T.bgCard, borderRadius: T.r.lg, borderWidth: 1, borderColor: T.accentBorder, padding: 22, marginBottom: 16 },
  pressureTitle: { color: T.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1, textAlign: 'center', marginBottom: 16, textTransform: 'uppercase' },
  pressureRow: { flexDirection: 'row', alignItems: 'center' },
  pressureDiv: { width: 1, height: 36, backgroundColor: T.border, marginHorizontal: 20 },
  pressureItem: { flex: 1, alignItems: 'center' },
  pressureLbl: { color: T.textSoft, fontSize: 12 },
  pressureVal: { color: T.text, fontSize: 24, fontWeight: '700', marginTop: 4 },

  card: { backgroundColor: T.bgCard, borderRadius: T.r.lg, borderWidth: 1, borderColor: T.border, padding: 22, marginBottom: 16 },
  cardTitle: { color: T.accent, fontSize: 14, fontWeight: '700', letterSpacing: 0.4, marginBottom: 10 },
  cardDesc: { color: T.textSoft, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  steps: { gap: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: T.accentDim, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: T.accent, fontSize: 12, fontWeight: '700' },
  stepText: { color: T.text, fontSize: 13, flex: 1, lineHeight: 19 },
  garageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  garageIcon: { width: 32, height: 32, borderRadius: T.r.sm, backgroundColor: T.accentDim, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  garageName: { color: T.text, fontSize: 14, fontWeight: '500', flex: 1 },
  garageDist: { color: T.ok, fontSize: 12, fontWeight: '600' },
  btns: { gap: 12, marginTop: 8 },
});
