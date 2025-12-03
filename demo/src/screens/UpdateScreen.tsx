import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader, ActionCard } from '../components';

export function UpdateScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

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
        {/* Choose Upload Method */}
        <Text style={styles.stepLabel}>CHOOSE HOW TO UPLOAD</Text>
        
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
