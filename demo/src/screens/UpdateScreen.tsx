import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, DemoButton, ActionCard } from '../components';
import { useDemoState } from '../context/DemoStateContext';
import { useNFC } from '../hooks/useNFC';

export function UpdateScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { performSync } = useDemoState();
  const { readTag, status: nfcStatus } = useNFC();
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSync = async () => {
    setSyncLoading(true);
    
    try {
      const tagContent = await readTag();
      
      if (tagContent) {
        const result = performSync();
        
        if (result === 'reset') {
          Alert.alert('Sync Complete', 'Demo cycle complete! Starting over.');
        } else if (result === 'decreased') {
          Alert.alert('Sync Complete', 'Car condition decreased by 2%');
        } else if (result === 'increased') {
          Alert.alert('Sync Complete', 'Car condition improved by 5%! 🎉');
        } else {
          Alert.alert('Sync Complete', 'Initial sync successful!');
        }
      }
    } catch (error) {
      console.error('NFC error:', error);
    } finally {
      setSyncLoading(false);
    }
  };

  const handlePhotoRegister = () => {
    navigation.navigate('PhotoRegister');
  };

  const handleActionPress = (action: string) => {
    Alert.alert(action, `This would open the ${action.toLowerCase()} feature.`);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <DemoHeader
        showBack
        onBack={() => navigation.goBack()}
        title="Upload Update"
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Step 1: Sync */}
        <Text style={styles.stepLabel}>1. TAP TO SYNC WITH YOUR TAG</Text>
        
        <DemoButton
          label={nfcStatus === 'scanning' ? 'Waiting for NFC...' : 'Sync to Upload'}
          icon="wifi"
          onPress={handleSync}
          loading={syncLoading || nfcStatus === 'scanning'}
          variant="primary"
          style={styles.syncButton}
        />
        
        {/* Step 2: Choose Upload Method */}
        <Text style={styles.stepLabel}>2. CHOOSE HOW TO UPLOAD</Text>
        
        <View style={styles.actionGrid}>
          <ActionCard
            icon="camera-outline"
            label="Photo Register"
            onPress={handlePhotoRegister}
          />
          <ActionCard
            icon="cloud-upload-outline"
            label="Upload Document"
            onPress={() => handleActionPress('Upload Document')}
          />
          <ActionCard
            icon="document-text-outline"
            label="New Activity"
            onPress={() => handleActionPress('New Activity')}
          />
          <ActionCard
            icon="home-outline"
            label="Register Garage"
            onPress={() => handleActionPress('Register Garage')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  stepLabel: {
    color: '#64748b',
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 16,
  },
  syncButton: {
    marginBottom: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
