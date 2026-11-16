import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  // Size classes
  let sizeClass = '';
  switch (size) {
    case 'sm':
      sizeClass = 'h-4 w-4';
      break;
    case 'md':
      sizeClass = 'h-8 w-8';
      break;
    case 'lg':
      sizeClass = 'h-12 w-12';
      break;
  }
  
  // Color classes
  const colorClass = color === 'primary' 
    ? 'border-primary-500' 
    : 'border-white';

  return (
    <div className={`${className}`}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 ${colorClass} ${sizeClass}`}></div>
    </div>
  );
};

export default Loader;
