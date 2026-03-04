import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, DemoButton } from '../components';
import { useDemoState } from '../context/DemoStateContext';
import { MAINTENANCE_GUIDES } from '../data/carProfiles';
import { T } from '../theme';

export function WaterDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { selectedCar } = useDemoState();
  const guide = MAINTENANCE_GUIDES.water;

  return (
    <View style={[s.screen, { paddingBottom: insets.bottom }]}>
      <DemoHeader showBack onBack={() => navigation.goBack()} />
      <ScrollView style={s.scroll} contentContainerStyle={s.inner}>
        <View style={s.titleRow}>
          <View style={s.titleIcon}><Ionicons name="water-outline" size={20} color={T.accent} /></View>
          <Text style={s.title}>{guide.title}</Text>
        </View>

        <View style={[s.alert, { backgroundColor: T.warnDim }]}>
          <Ionicons name="alert-circle" size={18} color={T.warn} />
          <Text style={[s.alertText, { color: T.warn }]}>Check water level and refill tank</Text>
        </View>

        <Text style={s.rec}>
          Coolant level should be checked on your {selectedCar?.brand} {selectedCar?.model} {guide.interval.toLowerCase()}.
        </Text>

        <View style={s.card}>
          <Text style={s.cardTitle}>Maintenance Guide</Text>
          <Text style={s.cardDesc}>{guide.recommendation}</Text>
          <View style={s.steps}>
            {['Ensure engine is completely cold', 'Locate coolant reservoir (translucent with MIN/MAX)', 'Check level is between MIN and MAX', 'If low, add 50/50 coolant and distilled water', 'Never open radiator cap when hot!'].map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                <Text style={s.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={s.warnNote}>
            <Ionicons name="warning" size={16} color={T.warn} />
            <Text style={s.warnNoteText}>Opening a hot radiator can cause severe burns</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Nearby Garages</Text>
          <Text style={s.cardDesc}>If you notice frequent coolant loss, have your system inspected.</Text>
          <GarageRow name={`${selectedCar?.brand} Service Center`} dist="1.5 km" />
          <GarageRow name="QuickFix Auto" dist="2.9 km" />
        </View>

        <View style={s.btns}>
          <DemoButton label="Upload Update" icon="add-circle-outline" onPress={() => Alert.alert('Upload', 'This would open the upload dialog')} variant="outline" />
        </View>
      </ScrollView>
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
  steps: { gap: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: T.accentDim, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: T.accent, fontSize: 12, fontWeight: '700' },
  stepText: { color: T.text, fontSize: 13, flex: 1, lineHeight: 19 },
  warnNote: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, padding: 14, backgroundColor: T.warnDim, borderRadius: T.r.md },
  warnNoteText: { color: T.warn, fontSize: 12, flex: 1, fontWeight: '500' },
  garageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  garageIcon: { width: 32, height: 32, borderRadius: T.r.sm, backgroundColor: T.accentDim, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  garageName: { color: T.text, fontSize: 14, fontWeight: '500', flex: 1 },
  garageDist: { color: T.ok, fontSize: 12, fontWeight: '600' },
  btns: { gap: 12, marginTop: 8 },
});
