import { CarProfile, HealthMetrics, MaintenanceItem } from '../types';

export const CAR_PROFILES: CarProfile[] = [
  {
    id: 'seat-ibiza-2020',
    name: 'SEAT IBIZA 2020',
    brand: 'SEAT',
    model: 'Ibiza',
    year: 2020,
    fullModel: '1.0 TSI STYLE CONNECT 2020',
    registerDate: '28.12.2020',
    kilometers: 54133,
    fuelType: 'Diesel',
    gearType: 'Manual',
    power: '95 CV / 70KW',
    traction: 'Front',
    initialHealth: 75,
    verifiedHistory: 68,
  },
  {
    id: 'cupra-formentor-2022',
    name: 'CUPRA FORMENTOR 2022',
    brand: 'CUPRA',
    model: 'Formentor',
    year: 2022,
    fullModel: '2.0 TSI VZ 2022',
    registerDate: '15.03.2022',
    kilometers: 28450,
    fuelType: 'Gasoline',
    gearType: 'Automatic',
    power: '310 CV / 228KW',
    traction: 'AWD',
    initialHealth: 88,
    verifiedHistory: 92,
  },
  {
    id: 'seat-leon-2019',
    name: 'SEAT LEON 2019',
    brand: 'SEAT',
    model: 'Leon',
    year: 2019,
    fullModel: '1.5 TSI FR 2019',
    registerDate: '10.06.2019',
    kilometers: 72890,
    fuelType: 'Gasoline',
    gearType: 'Manual',
    power: '150 CV / 110KW',
    traction: 'Front',
    initialHealth: 65,
    verifiedHistory: 55,
  },
];

export const NFC_TAG_TO_CAR: Record<string, string> = {
  '1': 'seat-ibiza-2020',
  '2': 'cupra-formentor-2022',
  '3': 'seat-leon-2019',
};

export function getInitialMetrics(health: number): HealthMetrics {
  // Distribute health across metrics with some variation
  const variation = () => Math.floor(Math.random() * 10) - 5;
  return {
    overall: health,
    waterLevel: Math.min(100, Math.max(0, health + variation())),
    waterPump: Math.min(100, Math.max(0, health - 10 + variation())),
    oil: Math.min(100, Math.max(0, health - 5 + variation())),
    tires: Math.min(100, Math.max(0, health + 5 + variation())),
    mandatoryChecks: Math.min(100, Math.max(0, health - 15 + variation())),
  };
}

export function getMaintenanceItems(metrics: HealthMetrics): MaintenanceItem[] {
  return [
    {
      id: 'water',
      type: 'water',
      title: 'WATER LEVEL',
      subtitle: metrics.waterLevel < 70 ? 'Check water level and refill tank' : 'Water level is adequate',
      icon: 'water-outline',
      hasWarning: metrics.waterLevel < 70,
      warningLevel: metrics.waterLevel < 50 ? 'red' : metrics.waterLevel < 70 ? 'yellow' : 'none',
    },
    {
      id: 'waterPump',
      type: 'waterPump',
      title: 'WATER PUMP',
      subtitle: metrics.waterPump < 60 ? 'Over 20,000km' : 'Operating normally',
      icon: 'cog-outline',
      hasWarning: metrics.waterPump < 60,
      warningLevel: metrics.waterPump < 40 ? 'red' : metrics.waterPump < 60 ? 'yellow' : 'none',
    },
    {
      id: 'oil',
      type: 'oil',
      title: 'OIL',
      subtitle: metrics.oil < 70 ? 'No register of last oil check' : 'Oil level is good',
      icon: 'water',
      hasWarning: metrics.oil < 70,
      warningLevel: metrics.oil < 50 ? 'red' : metrics.oil < 70 ? 'yellow' : 'none',
    },
    {
      id: 'tires',
      type: 'tires',
      title: 'TIRES',
      subtitle: metrics.tires < 75 ? 'Check air pressure' : 'Tire pressure is optimal',
      icon: 'ellipse-outline',
      hasWarning: metrics.tires < 75,
      warningLevel: metrics.tires < 50 ? 'red' : metrics.tires < 75 ? 'yellow' : 'none',
    },
    {
      id: 'mandatoryChecks',
      type: 'mandatoryChecks',
      title: 'MANDATORY CHECKS',
      subtitle: metrics.mandatoryChecks < 60 ? 'ITV expired' : 'All checks up to date',
      icon: 'document-text-outline',
      hasWarning: metrics.mandatoryChecks < 60,
      warningLevel: metrics.mandatoryChecks < 40 ? 'red' : metrics.mandatoryChecks < 60 ? 'yellow' : 'none',
    },
  ];
}

export function adjustMetrics(metrics: HealthMetrics, delta: number): HealthMetrics {
  const adjust = (value: number) => Math.min(100, Math.max(0, value + delta));
  return {
    overall: adjust(metrics.overall),
    waterLevel: adjust(metrics.waterLevel),
    waterPump: adjust(metrics.waterPump),
    oil: adjust(metrics.oil),
    tires: adjust(metrics.tires),
    mandatoryChecks: adjust(metrics.mandatoryChecks),
  };
}

// State 1: Decreased metrics with warnings for tires and water pump
export function getDecreasedMetrics(metrics: HealthMetrics): HealthMetrics {
  return {
    overall: Math.max(0, metrics.overall - 2),
    waterLevel: metrics.waterLevel, // Keep same
    waterPump: 45, // Force warning (yellow at <60, red at <40)
    oil: metrics.oil, // Keep same
    tires: 55, // Force warning (yellow at <75, red at <50)
    mandatoryChecks: metrics.mandatoryChecks, // Keep same
  };
}

// State 2: Improved metrics with no warnings
export function getImprovedMetrics(baseHealth: number): HealthMetrics {
  const improvedHealth = baseHealth + 5;
  return {
    overall: improvedHealth,
    waterLevel: 85, // Good level, no warning
    waterPump: 80, // Good level, no warning
    oil: 85, // Good level, no warning
    tires: 90, // Good level, no warning
    mandatoryChecks: 75, // Good level, no warning
  };
}

export const MAINTENANCE_GUIDES: Record<string, { title: string; recommendation: string; interval: string }> = {
  water: {
    title: 'WATER LEVEL',
    recommendation: 'Check the coolant reservoir when the engine is cold. The level should be between the MIN and MAX marks.',
    interval: 'Check every 2 weeks or before long trips',
  },
  waterPump: {
    title: 'WATER PUMP',
    recommendation: 'The water pump should be inspected during timing belt replacement. Listen for unusual noises or check for leaks.',
    interval: 'Replace every 60,000-100,000 km or when replacing timing belt',
  },
  oil: {
    title: 'OIL',
    recommendation: 'Oil should be changed on your vehicle every 12 months or 10,000 miles, whichever comes first.',
    interval: 'Every 12 months or 10,000 miles',
  },
  tires: {
    title: 'TIRES',
    recommendation: 'Check tire pressure monthly when tires are cold. Inspect tread depth and look for uneven wear patterns.',
    interval: 'Check pressure monthly, rotate every 10,000 km',
  },
  mandatoryChecks: {
    title: 'MANDATORY CHECKS (ITV)',
    recommendation: 'The ITV (Inspección Técnica de Vehículos) is mandatory in Spain. Vehicles over 4 years old must pass annually.',
    interval: 'Annually for vehicles over 4 years old',
  },
};
