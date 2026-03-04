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

export function OilDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { showDialog } = useDialog();
  const { selectedCar } = useDemoState();
  const guide = MAINTENANCE_GUIDES.oil;

  return (
    <View style={[s.screen, { paddingBottom: insets.bottom }]}>
      <DemoHeader showBack onBack={() => navigation.goBack()} />
      <ScrollView style={s.scroll} contentContainerStyle={s.inner}>
        {/* Title */}
        <View style={s.titleRow}>
          <View style={s.titleIcon}><Ionicons name="water" size={20} color={T.accent} /></View>
          <Text style={s.title}>{guide.title}</Text>
        </View>

        {/* Warning */}
        <View style={[s.alert, { backgroundColor: T.badDim }]}>
          <Ionicons name="alert-circle" size={18} color={T.bad} />
          <Text style={[s.alertText, { color: T.bad }]}>No register of last oil check</Text>
        </View>

        {/* Recommendation */}
        <Text style={s.rec}>
          Oil should be changed on your {selectedCar?.year} {selectedCar?.brand} {selectedCar?.model} every 12 months or 10,000 miles.
        </Text>

        {/* Guide card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Maintenance Guide</Text>
          <Text style={s.cardDesc}>{guide.recommendation}</Text>
          <View style={s.steps}>
            {['Park on level surface, warm engine', 'Locate dipstick and remove', 'Wipe clean and reinsert fully', 'Remove and check level', 'Oil should be between MIN and MAX'].map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                <Text style={s.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Garage card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Nearby Garages</Text>
          <Text style={s.cardDesc}>We recommend a certified garage for your {selectedCar?.brand}.</Text>
          <GarageRow name="Taller Mecánico García" dist="2.3 km" />
          <GarageRow name="AutoService Pro" dist="3.8 km" />
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

  garageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  garageIcon: { width: 32, height: 32, borderRadius: T.r.sm, backgroundColor: T.accentDim, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  garageName: { color: T.text, fontSize: 14, fontWeight: '500', flex: 1 },
  garageDist: { color: T.ok, fontSize: 12, fontWeight: '600' },

  btns: { gap: 12, marginTop: 8 },
});
