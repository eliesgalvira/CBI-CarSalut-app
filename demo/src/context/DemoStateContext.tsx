import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { DemoState, HealthMetrics, CarProfile } from '../types';
import { CAR_PROFILES, getInitialMetrics, adjustMetrics, NFC_TAG_TO_CAR } from '../data/carProfiles';

interface DemoContextValue {
  state: DemoState;
  selectedCar: CarProfile;
  cars: CarProfile[];
  selectCar: (carId: string) => void;
  selectCarByNFCTag: (tagContent: string) => void;
  performSync: () => 'health' | 'decreased' | 'increased' | 'reset';
  resetDemo: () => void;
  getLastSyncFormatted: () => string;
}

const getDefaultState = (carId: string): DemoState => {
  const car = CAR_PROFILES.find(c => c.id === carId) || CAR_PROFILES[0];
  return {
    selectedCarId: car.id,
    syncCount: 0,
    currentHealth: car.initialHealth,
    metrics: getInitialMetrics(car.initialHealth),
    lastSyncDate: 'FEB 6 /25',
  };
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => getDefaultState(CAR_PROFILES[0].id));

  const selectedCar = useMemo(
    () => CAR_PROFILES.find(c => c.id === state.selectedCarId) || CAR_PROFILES[0],
    [state.selectedCarId]
  );

  const selectCar = useCallback((carId: string) => {
    const car = CAR_PROFILES.find(c => c.id === carId);
    if (car) {
      setState({
        selectedCarId: car.id,
        syncCount: 0,
        currentHealth: car.initialHealth,
        metrics: getInitialMetrics(car.initialHealth),
        lastSyncDate: 'FEB 6 /25',
      });
    }
  }, []);

  const selectCarByNFCTag = useCallback((tagContent: string) => {
    const carId = NFC_TAG_TO_CAR[tagContent.trim()];
    if (carId) {
      selectCar(carId);
    }
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
    setState(getDefaultState(state.selectedCarId));
  }, [state.selectedCarId]);

  const getLastSyncFormatted = useCallback(() => {
    return state.lastSyncDate;
  }, [state.lastSyncDate]);

  const value = useMemo<DemoContextValue>(
    () => ({
      state,
      selectedCar,
      cars: CAR_PROFILES,
      selectCar,
      selectCarByNFCTag,
      performSync,
      resetDemo,
      getLastSyncFormatted,
    }),
    [state, selectedCar, selectCar, selectCarByNFCTag, performSync, resetDemo, getLastSyncFormatted]
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
