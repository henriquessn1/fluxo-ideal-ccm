export type ClientStatus = 'online' | 'offline' | 'warning';

export interface Client {
  id: string;
  name: string;
  description?: string;
  status: ClientStatus;
  lastSeen?: Date;
  ipAddress?: string;
  metrics?: {
    cpu?: number;
    memory?: number;
    disk?: number;
  };
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientFormData {
  name: string;
  description?: string;
  ipAddress?: string;
  tags?: string[];
}