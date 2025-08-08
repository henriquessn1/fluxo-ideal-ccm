import { useNavigate } from 'react-router-dom';
import { StatusCard } from '../components/ui/StatusCard';
import { useClients } from '../hooks/useClients';
import { Activity, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { data: clients = [], isLoading, error } = useClients();

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

  const onlineClients = clients.filter(c => c.status === 'online').length;
  const warningClients = clients.filter(c => c.status === 'warning').length;
  const offlineClients = clients.filter(c => c.status === 'offline').length;

  const summaryCards = [
    {
      title: 'Total de Clientes',
      value: clients.length,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-700',
      change: '+2 este mês',
      changeColor: 'text-green-600'
    },
    {
      title: 'Online',
      value: onlineClients,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      textColor: 'text-green-700',
      change: `${((onlineClients / clients.length) * 100).toFixed(0)}% ativos`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Com Alertas',
      value: warningClients,
      icon: AlertTriangle,
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100',
      textColor: 'text-yellow-700',
      change: warningClients > 0 ? 'Atenção necessária' : 'Tudo normal',
      changeColor: warningClients > 0 ? 'text-yellow-600' : 'text-green-600'
    },
    {
      title: 'Offline',
      value: offlineClients,
      icon: Activity,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      textColor: 'text-red-700',
      change: offlineClients > 0 ? 'Verificar conexão' : 'Todos conectados',
      changeColor: offlineClients > 0 ? 'text-red-600' : 'text-green-600'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Monitoramento em tempo real dos seus clientes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Auto-refresh: 30s
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const handleCardClick = () => {
            if (card.title === 'Total de Clientes') {
              navigate('/clients');
            } else if (card.title === 'Online') {
              // Filtrar clientes online - por enquanto vai para lista
              navigate('/clients');
            } else if (card.title === 'Com Alertas') {
              // Filtrar clientes com alertas - por enquanto vai para lista
              navigate('/clients');
            } else if (card.title === 'Offline') {
              // Filtrar clientes offline - por enquanto vai para lista
              navigate('/clients');
            }
          };

          return (
            <div 
              key={card.title}
              onClick={handleCardClick}
              className={`group bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 p-6 transition-all duration-300 animate-slide-up cursor-pointer overflow-hidden hover:scale-[1.02]`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none`} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} shadow-medium`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-200">
                    {card.value}
                  </p>
                </div>
              </div>
              
              {/* Change indicator */}
              <div className="flex items-center justify-end">
                <span className={`text-xs font-semibold ${card.changeColor} bg-white/60 px-2 py-1 rounded-full`}>
                  {card.change}
                </span>
              </div>
            </div>
            </div>
          );
        })}
      </div>

      {/* Clients Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Status dos Clientes</h2>
            <p className="text-gray-600 mt-1">
              Clique em um cliente para ver detalhes completos
            </p>
          </div>
          {clients.length > 0 && (
            <button
              onClick={() => navigate('/clients/new')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Users className="w-4 h-4 mr-2" />
              Adicionar Cliente
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clients.map((client, index) => (
            <div key={client.id} style={{ animationDelay: `${index * 150 + 400}ms` }}>
              <StatusCard
                title={client.name}
                subtitle={client.description}
                status={client.status}
                lastSeen={client.lastSeen}
                metrics={client.metrics}
                onClick={() => navigate(`/clients/${client.id}`)}
              />
            </div>
          ))}
        </div>

        {clients.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto animate-scale-in">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Nenhum cliente cadastrado</h3>
              <p className="text-gray-600 mb-8">
                Comece cadastrando seu primeiro cliente para começar o monitoramento em tempo real.
              </p>
              <button
                onClick={() => navigate('/clients/new')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Users className="w-5 h-5 mr-2" />
                Cadastrar Primeiro Cliente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}