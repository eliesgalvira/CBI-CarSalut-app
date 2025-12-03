export type ConnectionStatus = 'idle' | 'preparing' | 'scanning' | 'connecting' | 'connected' | 'disconnected';

export interface HeartbeatData {
  counter: number;
  timestamp: Date;
  raw: string;
}

export interface DiscoveredService {
  uuid: string;
  characteristics: DiscoveredCharacteristic[];
}

export interface DiscoveredCharacteristic {
  uuid: string;
  isReadable: boolean;
  isWritable: boolean;
  isNotifiable: boolean;
  serviceUUID: string;
}

export interface BLEState {
  status: ConnectionStatus;
  deviceName: string | null;
  deviceId: string | null;
  heartbeat: HeartbeatData | null;
  error: string | null;
  services: DiscoveredService[];
  selectedCharacteristic: DiscoveredCharacteristic | null;
}

// ========== NFC Types ==========

export type NFCStatus = 'idle' | 'checking' | 'scanning' | 'connected' | 'writing' | 'error';

export interface NFCTagInfo {
  id: string;
  techTypes: string[];
}

export interface NFCState {
  status: NFCStatus;
  isSupported: boolean;
  isEnabled: boolean;
  tagInfo: NFCTagInfo | null;
  lastMessage: string | null;
  error: string | null;
}

// ========== RC Car Racing Types ==========

export interface RCCarProfile {
  id: string;
  name: string;
  // Performance stats
  avgSpeed: number;      // km/h
  maxSpeed: number;      // km/h
  avgRPM: number;        // RPM
  maxRPM: number;        // RPM
  // Condition indicators
  batteryDrain: number;  // percentage per race (0-100)
  motorTemp: number;     // °C
  tireWear: number;      // percentage (0-100, higher = more wear)
  // Timing
  bestLapTime: number;   // seconds
  // Calculated strain factor (0-100, higher = more strain on car)
  strainFactor: number;
}

// ========== OBD Types ==========

export interface OBDData {
  rpm: number | null;           // Engine RPM (0-8000+)
  speed: number | null;         // Vehicle speed in km/h
  coolantTemp: number | null;   // Engine coolant temperature in °C
  engineLoad: number | null;    // Engine load percentage (0-100)
  timestamp: Date;
}

export interface OBDState {
  status: ConnectionStatus;
  deviceName: string | null;
  deviceId: string | null;
  obdData: OBDData | null;
  error: string | null;
  isPolling: boolean;
}

