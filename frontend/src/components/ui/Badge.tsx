import React from 'react';

type VariantType = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: VariantType;
  className?: string;
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  size = 'sm'
}) => {
  let variantClasses = '';
  
  // Apply different styles based on variant
  switch (variant) {
    case 'success':
      variantClasses = 'bg-green-100 text-green-800';
      break;
    case 'warning':
      variantClasses = 'bg-yellow-100 text-yellow-800';
      break;
    case 'danger':
      variantClasses = 'bg-red-100 text-red-800';
      break;
    case 'info':
      variantClasses = 'bg-blue-100 text-blue-800';
      break;
    default:
      variantClasses = 'bg-gray-100 text-gray-800';
  }

  // Apply size classes
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantClasses} ${sizeClasses} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
