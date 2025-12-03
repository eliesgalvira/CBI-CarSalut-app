import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CarProfile } from '../types';

interface InfoGridProps {
  car: CarProfile;
}

export function InfoGrid({ car }: InfoGridProps) {
  return (
    <View style={styles.container}>
      {/* Full Model Row */}
      <View style={styles.fullRow}>
        <Text style={styles.label}>MODEL.</Text>
        <Text style={styles.valueMain}>{car.fullModel}</Text>
      </View>

      {/* 4-Column Grid */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>REGISTER.</Text>
          <Text style={styles.value}>{car.registerDate}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>KM.</Text>
          <Text style={styles.value}>{car.kilometers.toLocaleString()}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>TYPE.</Text>
          <Text style={styles.value}>{car.fuelType.toUpperCase()}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>GEAR.</Text>
          <Text style={styles.value}>{car.gearType.toUpperCase()}</Text>
        </View>
      </View>

      {/* 2-Column Row */}
      <View style={styles.twoColGrid}>
        <View style={styles.twoColItem}>
          <Text style={styles.label}>POTENCE</Text>
          <Text style={styles.value}>{car.power}</Text>
        </View>
        <View style={styles.twoColItem}>
          <Text style={styles.label}>TRACTION</Text>
          <Text style={styles.value}>{car.traction.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
  },
  fullRow: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridItem: {
    width: '24%',
    alignItems: 'center',
    marginBottom: 8,
  },
  twoColGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  twoColItem: {
    alignItems: 'center',
  },
  label: {
    color: '#64748b',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  valueMain: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
