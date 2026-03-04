import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CarProfile } from '../types';
import { T } from '../theme';

interface CarDropdownProps {
  selectedCar: CarProfile;
  cars: CarProfile[];
  onSelect: (carId: string) => void;
}

export function CarDropdown({ selectedCar, cars, onSelect }: CarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (carId: string) => {
    onSelect(carId);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setIsOpen(true)} activeOpacity={0.7}>
        <Ionicons name="car-sport-outline" size={16} color={T.accent} />
        <Text style={styles.triggerText}>{selectedCar.name}</Text>
        <Ionicons name="chevron-down" size={14} color={T.textSoft} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Select Vehicle</Text>

            <FlatList
              data={cars}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const active = item.id === selectedCar.id;
                return (
                  <TouchableOpacity
                    style={[styles.carRow, active && styles.carRowActive]}
                    onPress={() => handleSelect(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.carIcon, active && styles.carIconActive]}>
                      <Ionicons name="car-sport" size={20} color={active ? T.accent : T.textMuted} />
                    </View>
                    <View style={styles.carInfo}>
                      <Text style={styles.carBrand}>{item.brand}</Text>
                      <Text style={styles.carModel}>{item.model} {item.year}</Text>
                      <Text style={styles.carMeta}>{item.kilometers.toLocaleString()} km  ·  {item.fuelType}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={22} color={T.accent} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.bgCard,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: T.r.full,
    borderWidth: 1,
    borderColor: T.accentBorder,
    gap: 8,
    alignSelf: 'center',
  },
  triggerText: {
    color: T.text,
    fontSize: 14,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: T.bgOverlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: T.bgElevated,
    borderTopLeftRadius: T.r.xl,
    borderTopRightRadius: T.r.xl,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '65%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.borderLight,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    color: T.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: T.r.md,
    marginBottom: 8,
    backgroundColor: T.bgCard,
    borderWidth: 1,
    borderColor: T.border,
  },
  carRowActive: {
    borderColor: T.accentBorder,
    backgroundColor: T.accentDim,
  },
  carIcon: {
    width: 44,
    height: 44,
    borderRadius: T.r.sm,
    backgroundColor: T.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  carIconActive: {
    backgroundColor: T.accentDim,
  },
  carInfo: { flex: 1 },
  carBrand: {
    color: T.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  carModel: {
    color: T.text,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  carMeta: {
    color: T.textSoft,
    fontSize: 12,
    marginTop: 3,
  },
});
