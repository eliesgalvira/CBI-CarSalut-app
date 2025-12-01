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

