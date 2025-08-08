import { LoadingSpinner } from './LoadingSpinner';

interface DataLoadingStateProps {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DataLoadingState({ 
  title = 'Carregando...', 
  description,
  size = 'md',
  className = ''
}: DataLoadingStateProps) {
  const sizeClasses = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} ${className}`}>
      <LoadingSpinner size={size === 'sm' ? 'md' : 'lg'} className="text-blue-500 mb-3" />
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 text-center max-w-md">{description}</p>
      )}
    </div>
  );
}