import axios from 'axios';
import type { Client, ClientFormData } from '../types/client';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get('/clients');
    return response.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (data: ClientFormData): Promise<Client> => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  update: async (id: string, data: ClientFormData): Promise<Client> => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },

  getStatus: async (id: string): Promise<{ status: string; metrics?: Record<string, unknown> }> => {
    const response = await api.get(`/clients/${id}/status`);
    return response.data;
  },
};

export const mockData: Client[] = [
  {
    id: '1',
    name: 'Cliente A - Escritório Principal',
    description: 'Sistema principal do escritório',
    status: 'online',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    ipAddress: '192.168.1.100',
    metrics: { cpu: 45.2, memory: 67.8, disk: 34.1 },
    tags: ['principal', 'escritório'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Cliente B - Filial Norte',
    description: 'Sistema da filial norte',
    status: 'warning',
    lastSeen: new Date(Date.now() - 15 * 60 * 1000),
    ipAddress: '192.168.2.100',
    metrics: { cpu: 78.4, memory: 85.2, disk: 91.5 },
    tags: ['filial', 'norte'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Cliente C - Servidor Backup',
    description: 'Servidor de backup automático',
    status: 'offline',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    ipAddress: '192.168.1.200',
    metrics: { cpu: 0, memory: 0, disk: 45.6 },
    tags: ['backup', 'servidor'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
];

export const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';