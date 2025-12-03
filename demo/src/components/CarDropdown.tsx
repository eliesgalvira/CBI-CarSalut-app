import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CarProfile } from '../types';

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
      <TouchableOpacity style={styles.dropdown} onPress={() => setIsOpen(true)}>
        <Text style={styles.dropdownText}>{selectedCar.name}</Text>
        <Ionicons name="chevron-down" size={16} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Car</Text>
            <FlatList
              data={cars}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.carItem,
                    item.id === selectedCar.id && styles.carItemSelected,
                  ]}
                  onPress={() => handleSelect(item.id)}
                >
                  <View style={styles.carItemContent}>
                    <Text style={styles.carBrand}>{item.brand}</Text>
                    <Text style={styles.carModel}>{item.model} {item.year}</Text>
                    <Text style={styles.carDetails}>{item.kilometers.toLocaleString()} km • {item.fuelType}</Text>
                  </View>
                  {item.id === selectedCar.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
    alignSelf: 'center',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  carItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  carItemSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  carItemContent: {
    flex: 1,
  },
  carBrand: {
    color: '#94a3b8',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  carModel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  carDetails: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
});
