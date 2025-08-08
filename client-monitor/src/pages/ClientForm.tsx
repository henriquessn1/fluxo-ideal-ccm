import { useNavigate, useParams } from 'react-router-dom';
import { ClientForm as ClientFormComponent } from '../components/ui/ClientForm';
import { useClient, useCreateClient, useUpdateClient } from '../hooks/useClients';
import type { ClientFormData } from '../types/client';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: client, isLoading: clientLoading, error: clientError } = useClient(id || '');
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const handleSubmit = async (data: ClientFormData) => {
    try {
      if (isEdit && id) {
        await updateClient.mutateAsync({ id, data });
      } else {
        await createClient.mutateAsync(data);
      }
      navigate('/clients');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  const isLoading = clientLoading || createClient.isPending || updateClient.isPending;
  const error = clientError || createClient.error || updateClient.error;

  if (isEdit && clientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isEdit && clientError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar cliente
            </h3>
            <div className="mt-2 text-sm text-red-700">
              Não foi possível carregar os dados do cliente.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro ao salvar
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <div className="ml-3 text-sm text-blue-700">
              {isEdit ? 'Salvando alterações...' : 'Criando cliente...'}
            </div>
          </div>
        </div>
      )}

      <ClientFormComponent
        client={client}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}