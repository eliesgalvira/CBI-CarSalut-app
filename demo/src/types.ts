// Demo App Types

export interface CarProfile {
  id: string;
  name: string;
  brand: 'SEAT' | 'CUPRA';
  model: string;
  year: number;
  fullModel: string; // e.g., "1.0 TSI STYLE CONNECT 2020"
  registerDate: string;
  kilometers: number;
  fuelType: 'Diesel' | 'Gasoline' | 'Electric' | 'Hybrid';
  gearType: 'Manual' | 'Automatic';
  power: string; // e.g., "95 CV / 70KW"
  traction: 'Front' | 'Rear' | 'AWD';
  initialHealth: number;
  verifiedHistory: number;
  image?: string; // placeholder for now
}

export interface MaintenanceItem {
  id: string;
  type: 'water' | 'waterPump' | 'oil' | 'tires' | 'mandatoryChecks';
  title: string;
  subtitle: string;
  icon: string; // Ionicons name
  hasWarning: boolean;
  warningLevel: 'none' | 'yellow' | 'red';
}

export interface HealthMetrics {
  overall: number;
  waterLevel: number;
  waterPump: number;
  oil: number;
  tires: number;
  mandatoryChecks: number;
}

export interface MaintenanceHistory {
  date: string;
  type: string;
  description: string;
  garage?: string;
  cost?: number;
}

export interface DemoState {
  isInitialized: boolean; // Whether a car has been selected via NFC
  selectedCarId: string | null; // null when not initialized
  readConditionCount: number; // 0-2 cycle for Read Car's Condition button
  currentHealth: number;
  metrics: HealthMetrics;
  lastSyncDate: string;
  userName: string | null; // User's name, asked at start
}

export type DemoTab = 'home' | 'condition' | 'update' | 'yourCar' | 'driver';

export type MaintenanceType = 'water' | 'waterPump' | 'oil' | 'tires' | 'mandatoryChecks';
