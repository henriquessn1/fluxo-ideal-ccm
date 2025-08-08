import { NavLink } from 'react-router-dom';
import { Home, Users, Settings, Activity, Plus, BarChart3, Zap } from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard', color: 'text-primary-600' },
    { to: '/clients', icon: Users, label: 'Clientes', color: 'text-blue-600' },
    { to: '/clients/new', icon: Plus, label: 'Novo Cliente', color: 'text-success-600' },
    { to: '/activity', icon: Activity, label: 'Atividade', color: 'text-warning-600' },
    { to: '/settings', icon: Settings, label: 'Configurações', color: 'text-gray-600' },
  ];

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

      {/* Footer */}
      <div className="p-4 flex-shrink-0">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-green-600" />
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