import { useParams, useNavigate } from 'react-router-dom';
import { useClient } from '../hooks/useClients';
import { 
  ArrowLeft, 
  Edit, 
  Circle, 
  Monitor, 
  Wifi, 
  Calendar, 
  Tag,
  Cpu,
  HardDrive,
  MemoryStick,
  AlertTriangle
} from 'lucide-react';

const statusConfig = {
  online: {
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Online'
  },
  offline: {
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Offline'
  },
  warning: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Aviso'
  }
};

export function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading, error } = useClient(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar cliente
            </h3>
            <div className="mt-2 text-sm text-red-700">
              Cliente não encontrado ou erro na conexão.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[client.status];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const formatLastSeen = (date?: Date) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    return 'Agora mesmo';
  };

  const getMetricColor = (value: number) => {
    if (value >= 90) return 'text-red-600 bg-red-100';
    if (value >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            {client.description && (
              <p className="text-gray-600 mt-1">{client.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate(`/clients/${client.id}/edit`)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Edit className="-ml-1 mr-2 h-5 w-5" />
          Editar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Status do Sistema
            </h2>
            
            <div className={`inline-flex items-center px-3 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border-2 mb-6`}>
              <Circle className={`w-4 h-4 mr-2 fill-current ${statusInfo.color}`} />
              <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Wifi className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">IP Address</p>
                  <p className="text-sm text-gray-600">{client.ipAddress || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Última Atividade</p>
                  <p className="text-sm text-gray-600">{formatLastSeen(client.lastSeen)}</p>
                </div>
              </div>
            </div>
          </div>

          {client.metrics && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Métricas de Performance</h2>
              
              <div className="space-y-4">
                {client.metrics.cpu !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Cpu className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium">CPU</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(client.metrics.cpu, 100)}%` }}
                        />
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMetricColor(client.metrics.cpu)}`}>
                        {client.metrics.cpu.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {client.metrics.memory !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MemoryStick className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Memória</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(client.metrics.memory, 100)}%` }}
                        />
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMetricColor(client.metrics.memory)}`}>
                        {client.metrics.memory.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {client.metrics.disk !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <HardDrive className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium">Disco</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min(client.metrics.disk, 100)}%` }}
                        />
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMetricColor(client.metrics.disk)}`}>
                        {client.metrics.disk.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Informações</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criado em
                </label>
                <p className="text-sm text-gray-600">{formatDate(client.createdAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atualizado em
                </label>
                <p className="text-sm text-gray-600">{formatDate(client.updatedAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID do Cliente
                </label>
                <p className="text-sm text-gray-600 font-mono">{client.id}</p>
              </div>
            </div>
          </div>

          {client.tags && client.tags.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Tags
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}