import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, Modal, TextInput,
  TouchableOpacity, TouchableWithoutFeedback, Keyboard, Animated, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDemoState } from '../context/DemoStateContext';
import { useNFC } from '../hooks/useNFC';
import { DemoHeader, HealthCircle, DemoButton } from '../components';
import { T } from '../theme';

const RANDOM_SYNC_FALLBACK_ENABLED = process.env.EXPO_PUBLIC_RANDOM_SYNC_FALLBACK === '1';

export function DemoHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    state, cars, selectedCar, selectCar, selectCarByNFCTag,
    isInitialized, pendingNotifications, readCondition,
    resetToUninitialized, setUserName,
  } = useDemoState();
  const { readTag, status: nfcStatus, error: nfcError } = useNFC();
  const [syncLoading, setSyncLoading] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(!state.userName);
  const [nameInput, setNameInput] = useState('');

  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvt, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: -e.endCoordinates.height / 3,
        duration: Platform.OS === 'ios' ? e.duration : 200,
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvt, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e as any).duration ?? 200 : 200,
        useNativeDriver: true,
      }).start();
    });

    return () => { showSub.remove(); hideSub.remove(); };
  }, [keyboardOffset]);

  const handleSyncToUpload = async () => {
    setSyncLoading(true);
    try {
      if (RANDOM_SYNC_FALLBACK_ENABLED) {
        const randomCar = cars[Math.floor(Math.random() * cars.length)];
        selectCar(randomCar.id);
        Alert.alert('Car Loaded', `Selected ${randomCar.name} for testing.`, [{ text: 'OK' }]);
        return;
      }
      const tagContent = await readTag();
      if (tagContent) {
        const success = selectCarByNFCTag(tagContent);
        if (!success) {
          Alert.alert('Unknown Tag', `Tag "${tagContent}" not recognized. Use tag 1–4.`, [{ text: 'OK' }]);
        }
      } else if (nfcError) {
        Alert.alert('NFC Error', nfcError, [{ text: 'OK' }]);
      }
    } catch {
      Alert.alert('Error', 'Failed to read NFC tag. Please try again.', [{ text: 'OK' }]);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleReadCondition = () => {
    readCondition();
    navigation.navigate('ConditionTab');
  };

  const handleReset = () => {
    Alert.alert('Reset Demo', 'Return to uninitialized state?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive',
        onPress: () => { resetToUninitialized(); setNameModalVisible(true); setNameInput(''); },
      },
    ]);
  };

  const handleNameSubmit = () => {
    const name = nameInput.trim();
    if (name) { setUserName(name); setNameModalVisible(false); }
  };

  const greeting = state.userName ? `Hello, ${state.userName}` : 'Hello';

  /* ── Name modal ─────────────────────────────────────────── */
  const renderNameModal = () => (
    <Modal visible={nameModalVisible} transparent animationType="fade" onRequestClose={() => {}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { transform: [{ translateY: keyboardOffset }] }]}>
            <View style={styles.modalIcon}>
              <Ionicons name="car-sport" size={32} color={T.accent} />
            </View>
            <Text style={styles.modalTitle}>Welcome to CarSight</Text>
            <Text style={styles.modalSub}>Enter your name to get started</Text>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor={T.textMuted}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleNameSubmit}
            />
            <TouchableOpacity
              style={[styles.modalBtn, !nameInput.trim() && styles.modalBtnDisabled]}
              onPress={handleNameSubmit}
              disabled={!nameInput.trim()}
              activeOpacity={0.7}
            >
              <Text style={styles.modalBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  /* ── UNINITIALIZED ──────────────────────────────────────── */
  if (!isInitialized) {
    return (
      <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
        {renderNameModal()}
        <DemoHeader />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>Tap your CarSight tag to begin</Text>

          <View style={styles.circleArea}>
            <View style={styles.placeholderRing}>
              <Ionicons name="radio-outline" size={56} color={T.textMuted} />
              <Text style={styles.placeholderDash}>– –</Text>
            </View>
          </View>

          <View style={styles.btnArea}>
            <DemoButton
              label={nfcStatus === 'scanning' ? 'Waiting for NFC…' : 'Sync to Upload'}
              icon="wifi"
              onPress={handleSyncToUpload}
              loading={syncLoading || nfcStatus === 'scanning'}
              variant="primary"
            />
          </View>

          <Text style={styles.hint}>
            {RANDOM_SYNC_FALLBACK_ENABLED
              ? 'Random sync fallback enabled.\nTap to load a random car profile.'
              : 'Hold your phone near the NFC tag\nTag 1 = Ibiza · 2 = Formentor · 3 = Leon · 4 = Born'}
          </Text>
        </ScrollView>
      </View>
    );
  }

  /* ── INITIALIZED ────────────────────────────────────────── */
  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      {renderNameModal()}
      <DemoHeader />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
        <Text style={styles.greeting}>{greeting}</Text>

        {selectedCar && (
          <View style={styles.carBadge}>
            <Ionicons name="car-sport" size={14} color={T.accent} />
            <Text style={styles.carBadgeText}>{selectedCar.name}</Text>
          </View>
        )}

        <View style={styles.circleArea}>
          <HealthCircle percentage={state.currentHealth} size={250} />
        </View>

        <View style={styles.btnArea}>
          <View style={styles.condBtnWrap}>
            <DemoButton
              label="Read Car's Condition"
              icon="bluetooth"
              onPress={handleReadCondition}
              variant="secondary"
              style={{ width: '100%' } as any}
            />
            {pendingNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingNotifications}</Text>
              </View>
            )}
          </View>
        </View>

        <DemoButton
          label="Reset Demo"
          icon="refresh-outline"
          onPress={handleReset}
          variant="outline"
          style={styles.resetBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  scrollInner: { paddingHorizontal: 24, paddingBottom: 32, alignItems: 'center' },

  greeting: { fontSize: 30, fontWeight: '300', color: T.text, marginTop: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: T.textSoft, marginTop: 6 },

  circleArea: { marginVertical: 36 },
  placeholderRing: {
    width: 250, height: 250, borderRadius: 125,
    borderWidth: 14, borderColor: T.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: T.bgCard,
  },
  placeholderDash: { fontSize: 40, color: T.textMuted, fontWeight: '200', marginTop: 8 },

  carBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: T.accentDim, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: T.r.full, marginTop: 10,
  },
  carBadgeText: { color: T.accent, fontSize: 13, fontWeight: '600' },

  btnArea: { width: '100%' },
  condBtnWrap: { position: 'relative' },
  badge: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: T.bad, minWidth: 22, height: 22,
    borderRadius: T.r.full, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  hint: { marginTop: 28, color: T.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 19 },
  resetBtn: { marginTop: 28, width: '55%' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: T.bgOverlay,
    justifyContent: 'center', alignItems: 'center', padding: 28,
  },
  modalCard: {
    backgroundColor: T.bgElevated, borderRadius: T.r.xl,
    padding: 32, width: '100%', maxWidth: 360, alignItems: 'center',
    borderWidth: 1, borderColor: T.border,
  },
  modalIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: T.accentDim, alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
  },
  modalTitle: { fontSize: 24, fontWeight: '700', color: T.text, marginBottom: 6 },
  modalSub: { fontSize: 15, color: T.textSoft, marginBottom: 24 },
  nameInput: {
    width: '100%', backgroundColor: T.bgInput, borderRadius: T.r.md,
    paddingHorizontal: 18, paddingVertical: 16, fontSize: 17, color: T.text,
    borderWidth: 1, borderColor: T.borderLight, textAlign: 'center',
    marginBottom: 20,
  },
  modalBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.accent, paddingVertical: 14, paddingHorizontal: 36,
    borderRadius: T.r.md,
  },
  modalBtnDisabled: { backgroundColor: T.bgElevated },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
