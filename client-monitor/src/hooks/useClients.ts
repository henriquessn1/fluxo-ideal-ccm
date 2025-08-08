import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi, mockData, useMockData } from '../services/api';
import type { Client, ClientFormData } from '../types/client';

const QUERY_KEYS = {
  clients: ['clients'] as const,
  client: (id: string) => ['clients', id] as const,
};

export function useClients() {
  return useQuery({
    queryKey: QUERY_KEYS.clients,
    queryFn: async () => {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockData;
      }
      return clientsApi.getAll();
    },
    refetchInterval: 30000,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.client(id),
    queryFn: async () => {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const client = mockData.find(c => c.id === id);
        if (!client) throw new Error('Cliente não encontrado');
        return client;
      }
      return clientsApi.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ClientFormData) => {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newClient: Client = {
          id: Math.random().toString(36).substr(2, 9),
          ...data,
          status: 'offline',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockData.push(newClient);
        return newClient;
      }
      return clientsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClientFormData }) => {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockData.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Cliente não encontrado');
        
        const updatedClient = {
          ...mockData[index],
          ...data,
          updatedAt: new Date(),
        };
        mockData[index] = updatedClient;
        return updatedClient;
      }
      return clientsApi.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.client(id) });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockData.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Cliente não encontrado');
        mockData.splice(index, 1);
        return;
      }
      return clientsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
    },
  });
}