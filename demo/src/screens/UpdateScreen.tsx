import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DemoHeader, ActionCard } from '../components';
import { T } from '../theme';
import { useDialog } from '../context/DialogContext';

export function UpdateScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { showDialog } = useDialog();

  const handlePhotoRegister = () => navigation.navigate('PhotoRegister');
  const handleAction = (name: string) =>
    showDialog({ title: name, message: `This would open the ${name.toLowerCase()} feature.`, buttons: [{ text: 'OK' }] });

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <DemoHeader showBack onBack={() => navigation.goBack()} title="Upload Update" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        <Text style={styles.heading}>Choose how to upload</Text>
        <Text style={styles.sub}>Select an upload method to update your car's records</Text>

        <View style={styles.grid}>
          <ActionCard icon="camera-outline" label="Photo Register" onPress={handlePhotoRegister} />
          <ActionCard icon="cloud-upload-outline" label="Upload Document" onPress={() => handleAction('Upload Document')} />
          <ActionCard icon="document-text-outline" label="New Activity" onPress={() => handleAction('New Activity')} />
          <ActionCard icon="home-outline" label="Register Garage" onPress={() => handleAction('Register Garage')} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 20, paddingBottom: 28 },
  heading: { color: T.text, fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 4 },
  sub: { color: T.textSoft, fontSize: 14, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
