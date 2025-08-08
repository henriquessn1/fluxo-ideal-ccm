import type { ClientStatus } from '../../types/client';
import { AlertCircle, CheckCircle, XCircle, Cpu, HardDrive, MemoryStick, Clock, ChevronRight } from 'lucide-react';

interface StatusCardProps {
  title: string;
  subtitle?: string;
  status: ClientStatus;
  lastSeen?: Date;
  metrics?: {
    cpu?: number;
    memory?: number;
    disk?: number;
  };
  onClick?: () => void;
}

const statusConfig = {
  online: {
    gradient: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-200',
    statusBg: 'bg-green-500',
    statusText: 'text-green-700',
    icon: CheckCircle,
    label: 'Online'
  },
  offline: {
    gradient: 'bg-gradient-to-br from-red-50 to-red-100',
    border: 'border-red-200',
    statusBg: 'bg-red-500',
    statusText: 'text-red-700',
    icon: XCircle,
    label: 'Offline'
  },
  warning: {
    gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    border: 'border-yellow-200',
    statusBg: 'bg-yellow-500',
    statusText: 'text-yellow-700',
    icon: AlertCircle,
    label: 'Aviso'
  }
};

export function StatusCard({ title, subtitle, status, lastSeen, metrics, onClick }: StatusCardProps) {
  const config = statusConfig[status];

  const formatLastSeen = (date?: Date) => {
    if (!date) return 'Nunca conectado';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    if (minutes > 0) return `${minutes} min atrás`;
    return 'Agora mesmo';
  };

  const getMetricColor = (value: number) => {
    if (value >= 90) return 'text-red-600 bg-red-100';
    if (value >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'from-red-400 to-red-500';
    if (value >= 70) return 'from-yellow-400 to-yellow-500';
    return 'from-green-400 to-green-500';
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl ${config.border} border transition-all duration-300 cursor-pointer overflow-hidden animate-slide-up`}
      onClick={onClick}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 ${config.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-gray-800 transition-colors">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1 truncate">{subtitle}</p>
            )}
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center ml-4 shrink-0">
            <div className={`flex items-center px-3 py-1.5 rounded-full ${config.gradient} shadow-soft`}>
              <div className={`w-2 h-2 rounded-full ${config.statusBg} mr-2 animate-pulse-soft`} />
              <span className={`text-xs font-semibold ${config.statusText} uppercase tracking-wide`}>
                {config.label}
              </span>
            </div>
          </div>
        </div>

        {/* Last Seen */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          <span>{formatLastSeen(lastSeen)}</span>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="space-y-4">
            {metrics.cpu !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Cpu className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">CPU</span>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${getMetricColor(metrics.cpu)}`}>
                    {metrics.cpu.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getProgressColor(metrics.cpu)} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${Math.min(metrics.cpu, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            {metrics.memory !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MemoryStick className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Memória</span>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${getMetricColor(metrics.memory)}`}>
                    {metrics.memory.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getProgressColor(metrics.memory)} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${Math.min(metrics.memory, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            {metrics.disk !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HardDrive className="w-4 h-4 text-purple-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Disco</span>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${getMetricColor(metrics.disk)}`}>
                    {metrics.disk.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getProgressColor(metrics.disk)} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${Math.min(metrics.disk, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Indicator */}
        <div className="flex justify-end mt-6">
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </div>
  );
}