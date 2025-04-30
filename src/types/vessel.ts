
export interface Port {
  name: string;
  eta: string; // ISO date string
  etd: string; // ISO date string
}

export interface Vessel {
  id: string;
  name: string;
  loadingPort: Port;
  dischargePort: Port;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface VesselFormData {
  name: string;
  loadingPortName: string;
  loadingPortEta: string;
  loadingPortEtd: string;
  dischargePortName: string;
  dischargePortEta: string;
  dischargePortEtd: string;
}
