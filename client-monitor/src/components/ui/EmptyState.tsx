import type { ReactNode } from 'react';
import { AlertCircle, Database, Search } from 'lucide-react';

type IconType = 'database' | 'search' | 'error';

interface EmptyStateProps {
  icon?: IconType | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const iconMap: Record<IconType, React.ComponentType<{ className?: string }>> = {
  database: Database,
  search: Search,
  error: AlertCircle,
};

export function EmptyState({ 
  icon = 'database', 
  title, 
  description, 
  action,
  className = '' 
}: EmptyStateProps) {
  const IconComponent = typeof icon === 'string' ? iconMap[icon as IconType] : null;

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {IconComponent ? (
          <IconComponent className="w-8 h-8 text-gray-400" />
        ) : (
          icon
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
}