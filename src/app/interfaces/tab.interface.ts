export interface TabInfo {
  deviceId: string;
  tabId: string;
  userAgent: string;
  isActive: boolean;
  lastSeen: Date;
  status: string;
}

export interface DeviceGroup {
  deviceId: string;
  tabs: TabInfo[];
}

export interface TabsResponse {
  onlineCount: number;
  devices: DeviceGroup[];
}

export interface UpsertTabRequest {
  deviceId: string;
  tabId: string;
  userAgent: string;
  isActive: boolean;
}
