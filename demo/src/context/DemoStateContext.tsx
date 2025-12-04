import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { DemoState, HealthMetrics, CarProfile } from '../types';
import { CAR_PROFILES, getInitialMetrics, getDecreasedMetrics, getImprovedMetrics, NFC_TAG_TO_CAR } from '../data/carProfiles';

interface DemoContextValue {
  state: DemoState;
  selectedCar: CarProfile | null;
  cars: CarProfile[];
  isInitialized: boolean;
  pendingNotifications: number; // 3, 2, 1 countdown
  selectCar: (carId: string) => void;
  selectCarByNFCTag: (tagContent: string) => boolean;
  readCondition: () => 'initial' | 'decreased' | 'increased';
  resetDemo: () => void;
  resetToUninitialized: () => void;
  getLastSyncFormatted: () => string;
  setUserName: (name: string) => void;
}

// Default state: uninitialized (no car selected)
const getUninitializedState = (): DemoState => ({
  isInitialized: false,
  selectedCarId: null,
  readConditionCount: 0,
  currentHealth: 0,
  metrics: getInitialMetrics(0),
  lastSyncDate: 'FEB 6 /25',
  userName: null,
});

const getDefaultState = (carId: string, userName: string | null = null): DemoState => {
  const car = CAR_PROFILES.find(c => c.id === carId) || CAR_PROFILES[0];
  return {
    isInitialized: true,
    selectedCarId: car.id,
    readConditionCount: 0,
    currentHealth: car.initialHealth,
    metrics: getInitialMetrics(car.initialHealth),
    lastSyncDate: 'FEB 6 /25',
    userName,
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
      setState(prev => ({
        isInitialized: true,
        selectedCarId: car.id,
        readConditionCount: 0,
        currentHealth: car.initialHealth,
        metrics: getInitialMetrics(car.initialHealth),
        lastSyncDate: 'FEB 6 /25',
        userName: prev.userName,
      }));
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

  // Calculate pending notifications: readConditionCount + 1 (1, 2, 3)
  const pendingNotifications = state.readConditionCount + 1;

  // Read condition cycles through 3 states: 0 -> 1 -> 2 -> 0
  const readCondition = useCallback((): 'initial' | 'decreased' | 'increased' => {
    let result: 'initial' | 'decreased' | 'increased';

    setState(prev => {
      const car = CAR_PROFILES.find(c => c.id === prev.selectedCarId) || CAR_PROFILES[0];
      
      if (prev.readConditionCount === 0) {
        // State 0 -> 1: First read, decrease health by 2%, show warnings
        result = 'decreased';
        return {
          ...prev,
          readConditionCount: 1,
          currentHealth: prev.currentHealth - 2,
          metrics: getDecreasedMetrics(prev.metrics),
        };
      } else if (prev.readConditionCount === 1) {
        // State 1 -> 2: Second read, increase health by 5%, remove warnings
        result = 'increased';
        return {
          ...prev,
          readConditionCount: 2,
          currentHealth: prev.currentHealth + 5,
          metrics: getImprovedMetrics(car.initialHealth),
        };
      } else {
        // State 2 -> 0: Reset to initial
        result = 'initial';
        return {
          ...prev,
          readConditionCount: 0,
          currentHealth: car.initialHealth,
          metrics: getInitialMetrics(car.initialHealth),
        };
      }
    });

    return result!;
  }, []);

  const setUserName = useCallback((name: string) => {
    setState(prev => ({ ...prev, userName: name }));
  }, []);

  const resetDemo = useCallback(() => {
    if (state.selectedCarId) {
      setState(getDefaultState(state.selectedCarId, state.userName));
    }
  }, [state.selectedCarId, state.userName]);

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
      pendingNotifications,
      selectCar,
      selectCarByNFCTag,
      readCondition,
      resetDemo,
      resetToUninitialized,
      getLastSyncFormatted,
      setUserName,
    }),
    [state, selectedCar, isInitialized, pendingNotifications, selectCar, selectCarByNFCTag, readCondition, resetDemo, resetToUninitialized, getLastSyncFormatted, setUserName]
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
