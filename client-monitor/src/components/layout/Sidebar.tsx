import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Settings, Activity, Plus, BarChart3, Zap, LogOut, User } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard', color: 'text-primary-600' },
    { to: '/clients', icon: Users, label: 'Clientes', color: 'text-blue-600' },
    { to: '/clients/new', icon: Plus, label: 'Novo Cliente', color: 'text-success-600', requiresRole: 'admin' },
    { to: '/activity', icon: Activity, label: 'Atividade', color: 'text-warning-600' },
    { to: '/settings', icon: Settings, label: 'Configurações', color: 'text-gray-600', requiresRole: 'admin' },
  ].filter(item => !item.requiresRole || hasRole(item.requiresRole));

  return (
    <aside className="w-72 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Monitor CCM</h1>
            <p className="text-sm text-gray-500">Dashboard v2.0</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-grow overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative z-10 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border-l-4 border-blue-500' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-100 shadow-inner' 
                    : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-500'}`} />
                </div>
                <span className="ml-4 font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Footer */}
      <div className="p-4 flex-shrink-0 space-y-3">
        {/* User Profile */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.fullName || user?.username || 'Usuário'}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.email || 'email@exemplo.com'}
              </p>
              {user?.roles && user.roles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.roles.map((role) => (
                    <span 
                      key={role} 
                      className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-200 text-blue-800 rounded-full"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full mt-3 flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <LoadingSpinner size="sm" className="text-red-500 mr-2" />
                Saindo...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Sair
              </>
            )}
          </button>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900">Sistema Online</p>
              <p className="text-xs text-gray-500 truncate">Monitorando 3 clientes</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}