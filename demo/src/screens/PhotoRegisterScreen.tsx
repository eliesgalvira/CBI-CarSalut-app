import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { DemoHeader, DemoButton } from '../components';
import { T } from '../theme';

interface FormData {
  description: string;
  category: string;
  date: string;
  notes: string;
}

export function PhotoRegisterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraLaunched, setCameraLaunched] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    description: '',
    category: 'Maintenance',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    notes: '',
  });

  useEffect(() => {
    if (!cameraLaunched) {
      setCameraLaunched(true);
      launchCamera();
    }
  }, []);

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
  };

  const handleChooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
  };

  const handleUpload = async () => {
    if (!photo) { Alert.alert('No Photo', 'Please take or select a photo first.'); return; }
    if (!formData.description.trim()) { Alert.alert('Missing Description', 'Please enter a description.'); return; }
    setUploading(true);
    await new Promise(r => setTimeout(r, 2000));
    setUploading(false);
    Alert.alert('Upload Complete', 'Your photo has been registered successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const categories = ['Maintenance', 'Repair', 'Inspection', 'Damage', 'Other'];

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.screen, { paddingBottom: insets.bottom }]}>
        <DemoHeader showBack onBack={() => navigation.goBack()} title="Photo Register" />

        <ScrollView style={s.flex} contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
          {/* Photo Section */}
          <View style={s.photoSection}>
            {photo ? (
              <View style={s.previewWrap}>
                <Image key={photo} source={{ uri: photo }} style={s.previewImg} resizeMode="contain" />
                <TouchableOpacity style={s.removeBtn} onPress={() => setPhoto(null)}>
                  <Ionicons name="close-circle" size={28} color={T.bad} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.placeholder}>
                <View style={s.placeholderIcon}>
                  <Ionicons name="camera-outline" size={36} color={T.textMuted} />
                </View>
                <Text style={s.placeholderText}>No photo selected</Text>
              </View>
            )}

            <View style={s.photoBtns}>
              <TouchableOpacity style={s.photoBtn} onPress={launchCamera}>
                <Ionicons name="camera" size={18} color={T.accent} />
                <Text style={s.photoBtnText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.photoBtn} onPress={handleChooseFromGallery}>
                <Ionicons name="images" size={18} color={T.accent} />
                <Text style={s.photoBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={s.form}>
            {/* Description */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>Description <Text style={{ color: T.bad }}>*</Text></Text>
              <TextInput
                style={s.input}
                placeholder="Enter description…"
                placeholderTextColor={T.textMuted}
                value={formData.description}
                onChangeText={t => setFormData(p => ({ ...p, description: t }))}
              />
            </View>

            {/* Category */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[s.chip, formData.category === cat && s.chipActive]}
                    onPress={() => setFormData(p => ({ ...p, category: cat }))}
                  >
                    <Text style={[s.chipText, formData.category === cat && s.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Date */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>Date</Text>
              <View style={s.dateBox}>
                <Ionicons name="calendar-outline" size={18} color={T.textSoft} />
                <Text style={s.dateText}>{formData.date}</Text>
              </View>
            </View>

            {/* Notes */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>Notes <Text style={{ color: T.textMuted, fontWeight: '400' }}>(optional)</Text></Text>
              <TextInput
                style={[s.input, s.textArea]}
                placeholder="Add any additional notes…"
                placeholderTextColor={T.textMuted}
                value={formData.notes}
                onChangeText={t => setFormData(p => ({ ...p, notes: t }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Upload */}
          <View style={s.uploadWrap}>
            <DemoButton
              label={uploading ? 'Uploading…' : 'Upload Form'}
              icon="cloud-upload"
              onPress={handleUpload}
              loading={uploading}
              variant="primary"
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: T.bg },
  inner: { paddingHorizontal: 20, paddingBottom: 40 },

  /* Photo */
  photoSection: { marginTop: 16, marginBottom: 28 },
  placeholder: {
    width: '100%', height: 200,
    backgroundColor: T.bgCard, borderRadius: T.r.lg,
    borderWidth: 2, borderColor: T.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  placeholderIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: T.bgElevated, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  placeholderText: { color: T.textMuted, fontSize: 14 },
  previewWrap: {
    position: 'relative', width: '100%', height: 250,
    borderRadius: T.r.lg, backgroundColor: T.bgCard,
    borderWidth: 2, borderColor: T.accent, overflow: 'hidden',
  },
  previewImg: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: T.r.full },
  photoBtns: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 16 },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.accentDim, paddingHorizontal: 22, paddingVertical: 12,
    borderRadius: T.r.md, borderWidth: 1, borderColor: T.accent + '40',
  },
  photoBtnText: { color: T.accent, fontSize: 14, fontWeight: '600' },

  /* Form */
  form: { gap: 22 },
  fieldGroup: { gap: 8 },
  label: { color: T.accent, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: T.bgCard, borderRadius: T.r.md,
    paddingHorizontal: 16, paddingVertical: 14,
    color: T.text, fontSize: 15,
    borderWidth: 1, borderColor: T.border,
  },
  textArea: { minHeight: 100, paddingTop: 14 },
  chip: {
    backgroundColor: T.bgCard, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: T.r.full, marginRight: 10, borderWidth: 1, borderColor: T.border,
  },
  chipActive: { backgroundColor: T.accentDim, borderColor: T.accent },
  chipText: { color: T.textSoft, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: T.accent },
  dateBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: T.bgCard, borderRadius: T.r.md,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: T.border,
  },
  dateText: { color: T.text, fontSize: 15 },

  uploadWrap: { marginTop: 32 },
});
