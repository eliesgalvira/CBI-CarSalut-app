import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CarProfile } from '../types';
import { T } from '../theme';

interface InfoGridProps {
  car: CarProfile;
}

function Cell({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <View style={[styles.cell, wide && styles.cellWide]}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={[styles.cellValue, wide && styles.cellValueBig]}>{value}</Text>
    </View>
  );
}

export function InfoGrid({ car }: InfoGridProps) {
  return (
    <View style={styles.container}>
      <Cell label="MODEL" value={car.fullModel} wide />

      <View style={styles.divider} />

      <View style={styles.row}>
        <Cell label="REGISTERED" value={car.registerDate} />
        <Cell label="MILEAGE" value={`${car.kilometers.toLocaleString()} km`} />
      </View>

      <View style={styles.row}>
        <Cell label="FUEL" value={car.fuelType.toUpperCase()} />
        <Cell label="TRANSMISSION" value={car.gearType.toUpperCase()} />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Cell label="POWER" value={car.power} />
        <Cell label="DRIVETRAIN" value={car.traction.toUpperCase()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: T.bgCard,
    borderRadius: T.r.lg,
    borderWidth: 1,
    borderColor: T.border,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cell: {
    flex: 1,
    paddingVertical: 6,
  },
  cellWide: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  cellLabel: {
    color: T.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  cellValue: {
    color: T.text,
    fontSize: 13,
    fontWeight: '500',
  },
  cellValueBig: {
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: T.border,
    marginVertical: 10,
  },
});
