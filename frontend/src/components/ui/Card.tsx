import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  padding = 'md',
  action
}) => {
  let paddingClass = '';
  
  switch (padding) {
    case 'none':
      paddingClass = '';
      break;
    case 'sm':
      paddingClass = 'p-3';
      break;
    case 'md':
      paddingClass = 'p-5';
      break;
    case 'lg':
      paddingClass = 'p-6';
      break;
    default:
      paddingClass = 'p-5';
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={paddingClass}>{children}</div>
    </div>
  );
};

export default Card;
