import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, DemoButton } from '../components';
import { useDemoState } from '../context/DemoStateContext';
import { MAINTENANCE_GUIDES } from '../data/carProfiles';
import { T } from '../theme';

export function MandatoryChecksScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { selectedCar } = useDemoState();
  const guide = MAINTENANCE_GUIDES.mandatoryChecks;

  const carYear = selectedCar?.year ?? 2020;
  const vehicleAge = 2025 - carYear;
  const freq = vehicleAge >= 10 ? 'annually' : vehicleAge >= 4 ? 'every 2 years' : 'every 4 years';

  return (
    <View style={[s.screen, { paddingBottom: insets.bottom }]}>
      <DemoHeader showBack onBack={() => navigation.goBack()} />
      <ScrollView style={s.scroll} contentContainerStyle={s.inner}>
        <View style={s.titleRow}>
          <View style={s.titleIcon}><Ionicons name="document-text-outline" size={20} color={T.accent} /></View>
          <Text style={s.title}>{guide.title}</Text>
        </View>

        <View style={[s.alert, { backgroundColor: T.badDim }]}>
          <Ionicons name="alert-circle" size={18} color={T.bad} />
          <Text style={[s.alertText, { color: T.bad }]}>ITV expired</Text>
        </View>

        <Text style={s.rec}>
          Your {selectedCar?.brand} {selectedCar?.model} ({carYear}) requires ITV inspection {freq}.
        </Text>

        {/* Status card */}
        <View style={s.statusCard}>
          <StatusRow label="Last ITV" value="28.12.2023" />
          <StatusRow label="Status" badge="EXPIRED" />
          <StatusRow label="Vehicle Age" value={`${vehicleAge} years`} />
          <StatusRow label="Frequency" value={freq} />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>ITV Guide</Text>
          <Text style={s.cardDesc}>{guide.recommendation}</Text>

          <Text style={s.subHead}>What to bring</Text>
          {['Vehicle registration document', 'Technical inspection card', 'Valid insurance certificate', 'Previous ITV report'].map((item, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={s.bullet} />
              <Text style={s.bulletText}>{item}</Text>
            </View>
          ))}

          <Text style={[s.subHead, { marginTop: 14 }]}>What they check</Text>
          {['Brakes and suspension', 'Lights and signals', 'Emissions', 'Steering and chassis', 'Tires and wheels'].map((item, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={s.bullet} />
              <Text style={s.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Nearby ITV Stations</Text>
          <Text style={s.cardDesc}>Appointments are recommended.</Text>
          <GarageRow name="ITV Barcelona — Zona Franca" dist="4.2 km" />
          <GarageRow name="ITV Badalona" dist="6.8 km" />
          <GarageRow name="ITV L'Hospitalet" dist="5.1 km" />
        </View>

        <View style={s.fineWarn}>
          <Ionicons name="warning" size={18} color={T.bad} />
          <Text style={s.fineText}>Driving with expired ITV can result in fines up to 500 EUR and vehicle immobilization.</Text>
        </View>

        <View style={s.btns}>
          <DemoButton label="Upload Update" icon="add-circle-outline" onPress={() => Alert.alert('Upload', 'This would open the upload dialog')} variant="outline" />
        </View>
      </ScrollView>
    </View>
  );
}

function StatusRow({ label, value, badge }: { label: string; value?: string; badge?: string }) {
  return (
    <View style={s.sRow}>
      <Text style={s.sLabel}>{label}</Text>
      {badge ? (
        <View style={s.expBadge}><Text style={s.expText}>{badge}</Text></View>
      ) : (
        <Text style={s.sValue}>{value}</Text>
      )}
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

  statusCard: { backgroundColor: T.bgCard, borderRadius: T.r.lg, borderWidth: 1, borderColor: T.border, padding: 20, marginBottom: 16 },
  sRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: T.border },
  sLabel: { color: T.textSoft, fontSize: 13 },
  sValue: { color: T.text, fontSize: 13, fontWeight: '600' },
  expBadge: { backgroundColor: T.badDim, paddingHorizontal: 10, paddingVertical: 4, borderRadius: T.r.sm },
  expText: { color: T.bad, fontSize: 11, fontWeight: '700' },

  card: { backgroundColor: T.bgCard, borderRadius: T.r.lg, borderWidth: 1, borderColor: T.border, padding: 22, marginBottom: 16 },
  cardTitle: { color: T.accent, fontSize: 14, fontWeight: '700', letterSpacing: 0.4, marginBottom: 10 },
  cardDesc: { color: T.textSoft, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  subHead: { color: T.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  bullet: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: T.accent },
  bulletText: { color: T.text, fontSize: 13 },

  fineWarn: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: T.badDim, padding: 18, borderRadius: T.r.md, marginBottom: 16 },
  fineText: { color: T.bad, fontSize: 12, flex: 1, lineHeight: 18, fontWeight: '500' },

  garageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  garageIcon: { width: 32, height: 32, borderRadius: T.r.sm, backgroundColor: T.accentDim, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  garageName: { color: T.text, fontSize: 14, fontWeight: '500', flex: 1 },
  garageDist: { color: T.ok, fontSize: 12, fontWeight: '600' },
  btns: { gap: 12, marginTop: 8 },
});
