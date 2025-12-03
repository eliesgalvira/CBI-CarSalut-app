import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { DemoState, HealthMetrics, CarProfile } from '../types';
import { CAR_PROFILES, getInitialMetrics, adjustMetrics, NFC_TAG_TO_CAR } from '../data/carProfiles';

interface DemoContextValue {
  state: DemoState;
  selectedCar: CarProfile | null;
  cars: CarProfile[];
  isInitialized: boolean;
  selectCar: (carId: string) => void;
  selectCarByNFCTag: (tagContent: string) => boolean;
  performSync: () => 'health' | 'decreased' | 'increased' | 'reset';
  resetDemo: () => void;
  resetToUninitialized: () => void;
  getLastSyncFormatted: () => string;
}

// Default state: uninitialized (no car selected)
const getUninitializedState = (): DemoState => ({
  isInitialized: false,
  selectedCarId: null,
  syncCount: 0,
  currentHealth: 0,
  metrics: getInitialMetrics(0),
  lastSyncDate: 'FEB 6 /25',
});

const getDefaultState = (carId: string): DemoState => {
  const car = CAR_PROFILES.find(c => c.id === carId) || CAR_PROFILES[0];
  return {
    isInitialized: true,
    selectedCarId: car.id,
    syncCount: 0,
    currentHealth: car.initialHealth,
    metrics: getInitialMetrics(car.initialHealth),
    lastSyncDate: 'FEB 6 /25',
  };
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(getUninitializedState);

  const selectedCar = useMemo(
    () => state.selectedCarId ? CAR_PROFILES.find(c => c.id === state.selectedCarId) || null : null,
    [state.selectedCarId]
  );

  const isInitialized = state.isInitialized;

  const selectCar = useCallback((carId: string) => {
    const car = CAR_PROFILES.find(c => c.id === carId);
    if (car) {
      setState({
        isInitialized: true,
        selectedCarId: car.id,
        syncCount: 0,
        currentHealth: car.initialHealth,
        metrics: getInitialMetrics(car.initialHealth),
        lastSyncDate: 'FEB 6 /25',
      });
    }
  }, []);

  const selectCarByNFCTag = useCallback((tagContent: string): boolean => {
    const carId = NFC_TAG_TO_CAR[tagContent.trim()];
    if (carId) {
      selectCar(carId);
      return true;
    }
    return false;
  }, [selectCar]);

  const performSync = useCallback((): 'health' | 'decreased' | 'increased' | 'reset' => {
    let result: 'health' | 'decreased' | 'increased' | 'reset';

    setState(prev => {
      const newSyncCount = (prev.syncCount + 1) % 4;
      
      if (prev.syncCount === 0) {
        // First sync: show initial health (no change)
        result = 'health';
        return {
          ...prev,
          syncCount: newSyncCount,
        };
      } else if (prev.syncCount === 1) {
        // Second sync: decrease health by 2%
        result = 'decreased';
        return {
          ...prev,
          syncCount: newSyncCount,
          currentHealth: prev.currentHealth - 2,
          metrics: adjustMetrics(prev.metrics, -2),
        };
      } else if (prev.syncCount === 2) {
        // Third sync: increase health by 5%
        result = 'increased';
        return {
          ...prev,
          syncCount: newSyncCount,
          currentHealth: prev.currentHealth + 5,
          metrics: adjustMetrics(prev.metrics, 5),
        };
      } else {
        // Fourth sync (syncCount === 3): reset to initial
        result = 'reset';
        const car = CAR_PROFILES.find(c => c.id === prev.selectedCarId) || CAR_PROFILES[0];
        return {
          ...prev,
          syncCount: 0,
          currentHealth: car.initialHealth,
          metrics: getInitialMetrics(car.initialHealth),
        };
      }
    });

    return result!;
  }, []);

  const resetDemo = useCallback(() => {
    if (state.selectedCarId) {
      setState(getDefaultState(state.selectedCarId));
    }
  }, [state.selectedCarId]);

  const resetToUninitialized = useCallback(() => {
    setState(getUninitializedState());
  }, []);

  const getLastSyncFormatted = useCallback(() => {
    return state.lastSyncDate;
  }, [state.lastSyncDate]);

  const value = useMemo<DemoContextValue>(
    () => ({
      state,
      selectedCar,
      cars: CAR_PROFILES,
      isInitialized,
      selectCar,
      selectCarByNFCTag,
      performSync,
      resetDemo,
      resetToUninitialized,
      getLastSyncFormatted,
    }),
    [state, selectedCar, isInitialized, selectCar, selectCarByNFCTag, performSync, resetDemo, resetToUninitialized, getLastSyncFormatted]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoState(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoState must be used within a DemoStateProvider');
  }
  return context;
}
