import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientTable } from '../components/ui/ClientTable';
import { useClients, useDeleteClient } from '../hooks/useClients';
import type { Client } from '../types/client';
import { Plus, AlertTriangle } from 'lucide-react';

export function Clients() {
  const navigate = useNavigate();
  const { data: clients = [], isLoading, error } = useClients();
  const deleteClient = useDeleteClient();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleEdit = (client: Client) => {
    navigate(`/clients/${client.id}/edit`);
  };

  const handleDelete = async (clientId: string) => {
    if (deleteConfirm === clientId) {
      try {
        await deleteClient.mutateAsync(clientId);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
      }
    } else {
      setDeleteConfirm(clientId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar dados
            </h3>
            <div className="mt-2 text-sm text-red-700">
              Não foi possível carregar os clientes. Verifique sua conexão.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={() => navigate('/clients/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Novo Cliente
        </button>
      </div>

      {deleteConfirm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Confirmar exclusão
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                Clique novamente no ícone de exclusão para confirmar a remoção do cliente.
              </div>
            </div>
          </div>
        </div>
      )}

      <ClientTable
        clients={clients}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}