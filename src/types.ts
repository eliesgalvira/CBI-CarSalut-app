export type ConnectionStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected';

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

