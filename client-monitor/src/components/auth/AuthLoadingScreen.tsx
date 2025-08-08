import { Zap } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AuthLoadingScreenProps {
  message?: string;
}

export function AuthLoadingScreen({ message = 'Verificando autenticação...' }: AuthLoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Logo Animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto animate-pulse">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl opacity-20 animate-ping"></div>
        </div>

        {/* App Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Monitor CCM</h1>
        <p className="text-gray-600 mb-8">Dashboard v2.0</p>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center mb-4">
          <LoadingSpinner size="lg" className="text-blue-500" />
        </div>

        {/* Message */}
        <p className="text-gray-600 font-medium">{message}</p>

        {/* Progress Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Keycloak Info */}
        <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
          <p className="text-xs text-gray-500">
            🔐 Conectando com servidor de autenticação
          </p>
        </div>
      </div>
    </div>
  );
}