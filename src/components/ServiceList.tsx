import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { DiscoveredService, DiscoveredCharacteristic } from '../types';

interface ServiceListProps {
  services: DiscoveredService[];
  selectedCharacteristic: DiscoveredCharacteristic | null;
  onSelectCharacteristic: (char: DiscoveredCharacteristic) => void;
}

export function ServiceList({
  services,
  selectedCharacteristic,
  onSelectCharacteristic,
}: ServiceListProps) {
  if (services.length === 0) return null;

  const truncateUUID = (uuid: string) => {
    if (uuid.length > 8) {
      return `${uuid.substring(0, 8)}...`;
    }
    return uuid;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DISCOVERED SERVICES</Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {services.map((service) => (
          <View key={service.uuid} style={styles.serviceContainer}>
            <Text style={styles.serviceUUID}>{truncateUUID(service.uuid)}</Text>
            {service.characteristics.map((char) => {
              const isSelected = selectedCharacteristic?.uuid === char.uuid;
              const isNotifiable = char.isNotifiable;

              return (
                <TouchableOpacity
                  key={char.uuid}
                  style={[
                    styles.charContainer,
                    isSelected && styles.charSelected,
                    !isNotifiable && styles.charDisabled,
                  ]}
                  onPress={() => isNotifiable && onSelectCharacteristic(char)}
                  disabled={!isNotifiable}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.charUUID,
                      isSelected && styles.charUUIDSelected,
                    ]}
                  >
                    {truncateUUID(char.uuid)}
                  </Text>
                  <View style={styles.badges}>
                    {char.isReadable && <Badge label="R" color="#3b82f6" />}
                    {char.isWritable && <Badge label="W" color="#f59e0b" />}
                    {char.isNotifiable && (
                      <Badge
                        label="N"
                        color="#10b981"
                        active={isSelected}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Badge({
  label,
  color,
  active = false,
}: {
  label: string;
  color: string;
  active?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        { borderColor: color },
        active && { backgroundColor: color },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: active ? '#0a0a0f' : color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    maxHeight: 200,
  },
  scrollContent: {
    gap: 12,
  },
  serviceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  serviceUUID: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  charContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    marginTop: 4,
  },
  charSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  charDisabled: {
    opacity: 0.4,
  },
  charUUID: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  charUUIDSelected: {
    color: '#c7d2fe',
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
});

